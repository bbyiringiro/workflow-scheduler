import { IQueue } from "./IQueue";
import amqp, { Connection, Channel } from "amqplib";
import config from "../config";
import { Logger } from "../utils/Logger";

export class RabbitMQQueue implements IQueue {
  private connection: Connection | null = null;
  private channel: Channel | null = null;
  private queueName: string;

  constructor(queueName: string) {
    this.queueName = queueName;
  }

  async createQueue(queueName: string): Promise<IQueue> {
    const instance = new RabbitMQQueue(queueName);
    await instance.connect();
    return instance;
  }

  async connect(): Promise<void> {
    if (!this.queueName) {
      throw new Error("Queue name must be set before connecting.");
    }

    this.connection = await amqp.connect(config.rabbitmq.url);
    this.channel = await this.connection.createChannel();
    await this.channel.assertQueue(this.queueName, {
      durable: true,
      exclusive: false,
      autoDelete: false,
    });

    Logger.log("RabbitMQ temporary queue created", { queue: this.queueName });
  }

  async enqueue(data: any, retryCount: number = 0): Promise<void> {
    if (!this.channel) {
      throw new Error("Channel is not initialized");
    }
    const content = Buffer.from(JSON.stringify({ ...data, retryCount }));
    this.channel.sendToQueue(this.queueName, content, { persistent: true });
    Logger.log("Enqueued message to RabbitMQ", { queue: this.queueName, data });
  }

  process(queueName: string, handler: (data: any) => Promise<void>): void {
    if (!this.channel) {
      throw new Error("Channel is not initialized");
    }

    this.channel.consume(queueName, async (msg) => {
      if (msg !== null) {
        const data = JSON.parse(msg.content.toString());
        try {
          await handler(data);
          this.channel!.ack(msg);
          //   Logger.log("Processed message from RabbitMQ", {queue: queueName, data, });
        } catch (error) {
          const { maxRetries } = config.queue.retry;
          if (data.retryCount < maxRetries) {
            await this.enqueue(data, data.retryCount + 1);
          } else {
            this.channel!.nack(msg, false, false);
          }
        }
      }
    });
  }

  async close(): Promise<void> {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
    Logger.log("RabbitMQ connection closed", { queue: this.queueName });
  }
}
