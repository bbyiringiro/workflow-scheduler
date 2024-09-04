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
    const updatedData = { ...data, retryCount };
    const content = Buffer.from(JSON.stringify(updatedData));
    this.channel.sendToQueue(this.queueName, content, { persistent: true });
    Logger.log("Enqueued message to RabbitMQ", {
      queue: this.queueName,
      data: updatedData,
      retryCount,
    });
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
          this.scheduleRetry(data, msg); // Pass the original message for retry
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

  /**
   * Schedules a retry for a message that failed processing, using exponential backoff.
   *
   */
  scheduleRetry(data: any, msg: amqp.Message) {
    const retryCount = data.retryCount || 0;
    // Calculate the delay for the next retry using exponential backoff.
    // The delay increases exponentially with the number of retry attempts
    const delay = Math.pow(2, retryCount) * config.queue.retry.retryDelay;
    Logger.log(
      "Scheduling retry with delay: " +
        delay +
        "ms for retry count: " +
        (retryCount + 1)
    );

    setTimeout(() => this.retryMessage(data, retryCount + 1, msg), delay);
  }

  async retryMessage(data: any, retryCount: number, msg: amqp.Message) {
    if (retryCount <= config.queue.retry.maxRetries) {
      Logger.log("Retrying message", { data, retryCount });
      await this.enqueue(data, retryCount);
      this.channel!.ack(msg); // Acknowledge the original message
    } else {
      Logger.error("Max retries exceeded, not requeuing", { data });
      this.channel!.nack(msg, false, false); // Reject and don't requeue
    }
  }
}
