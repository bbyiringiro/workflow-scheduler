import { IQueue } from "./IQueue";
import Queue from "bull";
import config from "../config";
import { Logger } from "../utils/Logger";

export class BullQueue implements IQueue {
  private queue: Queue.Queue | null = null;

  constructor(private queueName: string) {}

  async createQueue(queueName: string): Promise<IQueue> {
    return new BullQueue(queueName);
  }

  async connect(): Promise<void> {
    if (!this.queueName) {
      throw new Error("Queue name must be set before connecting.");
    }

    this.queue = new Queue(this.queueName, {
      redis: {
        host: config.redis.host,
        port: config.redis.port,
      },
    });

    Logger.log("Bull temporary queue created", { queue: this.queueName });
  }

  async enqueue(data: any): Promise<void> {
    if (!this.queue) {
      throw new Error("Queue is not initialized");
    }
    await this.queue.add(data, {
      attempts: config.queue.retry.maxRetries,
      backoff: {
        type: "fixed",
        delay: config.queue.retry.retryDelay,
      },
    });
    // Logger.log("Enqueued message to Bull queue", {queue: this.queueName, data,});
  }

  process(queueName: string, handler: (data: any) => Promise<void>): void {
    if (!this.queue) {
      throw new Error("Queue is not initialized");
    }
    this.queue.process(async (job) => {
      try {
        await handler(job.data);
        // Logger.log("Processed job from Bull queue", { queue: queueName,data: job.data,});
      } catch (error) {
        Logger.error("Processing error in Bull queue", {
          queue: queueName,
          data: job.data,
          error,
        });
        throw error;
      }
    });
  }

  async close(): Promise<void> {
    if (this.queue) {
      await this.queue.close();
      Logger.log("Bull queue connection closed", {
        queue: this.queueName,
      });
    }
  }
}
