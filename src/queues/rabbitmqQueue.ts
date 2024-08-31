// src/queues/rabbitmqQueue.ts
import { IQueue } from "./IQueue";
import amqp, { Connection, Channel } from "amqplib";
import config from "../config";
import { Logger } from "../utils/Logger";

export class RabbitMQQueue implements IQueue {
  private connection: Connection;
  private channel: Channel;
  private queueName: string;

  constructor() {
    this.queueName = config.queue.name;
  }

  async enqueue(data: any): Promise<void> {
    const content = Buffer.from(JSON.stringify(data));
    this.channel.sendToQueue(this.queueName, content, { persistent: true });
    Logger.log("Enqueued message", { queue: this.queueName, data });
  }

  async connect(retries = 0): Promise<void> {
    try {
      this.connection = await amqp.connect(config.rabbitmq.url);
      this.channel = await this.connection.createChannel();
      await this.channel.assertQueue(this.queueName, { durable: true });
      Logger.log("RabbitMQ connected", { queue: this.queueName });
    } catch (error) {
      if (retries < config.rabbitmq.maxRetries) {
        Logger.warn(
          `Retrying to connect to RabbitMQ (${retries + 1}/${
            config.rabbitmq.maxRetries
          })...`
        );
        setTimeout(() => this.connect(retries + 1), config.rabbitmq.retryDelay);
      } else {
        Logger.error("Failed to connect to RabbitMQ after several attempts", {
          error,
        });
        process.exit(1);
      }
    }
  }

  process(handler: (data: any) => Promise<void>): void {
    if (!this.channel) {
      Logger.error(
        "Cannot start processing because the channel is not initialized."
      );
      throw new Error("RabbitMQ channel is not initialized.");
    }

    this.channel.consume(this.queueName, async (msg) => {
      if (msg !== null) {
        const data = JSON.parse(msg.content.toString());
        try {
          await handler(data);
          this.channel.ack(msg);
          Logger.log("Processed message", { queue: this.queueName, data });
        } catch (error) {
          Logger.error("Processing error", {
            queue: this.queueName,
            data,
            error,
          });
          // Optionally, handle how to deal with the error, such as moving to a dead-letter queue
          this.channel.nack(msg, false, false); // Do not requeue to avoid infinite loop
        }
      }
    });
  }

  async close() {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
    Logger.log("RabbitMQ connection closed", { queue: this.queueName });
  }
}