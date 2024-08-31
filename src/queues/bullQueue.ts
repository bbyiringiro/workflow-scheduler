import { IQueue } from "./IQueue";
import Queue from "bull";
import config from "../config";
import { Logger } from "../utils/Logger";

export class BullQueue implements IQueue {
  private queue: Queue.Queue;

  constructor() {
    this.queue = new Queue(config.bull.queueName, {
      redis: {
        host: config.redis.host,
        port: config.redis.port,
      },
    });
    Logger.log("Bull queue initialized", { queue: config.bull.queueName });
  }

  async enqueue(data: any): Promise<void> {
    await this.queue.add(data);
    Logger.log("Enqueued message to Bull queue", {
      queue: config.bull.queueName,
      data,
    });
  }

  process(handler: (data: any) => Promise<void>): void {
    this.queue.process(async (job) => {
      try {
        await handler(job.data);
        Logger.log("Processed job from Bull queue", {
          queue: config.bull.queueName,
          data: job.data,
        });
      } catch (error) {
        Logger.error("Processing error in Bull queue", {
          queue: config.bull.queueName,
          data: job.data,
          error,
        });
        throw error;
      }
    });
  }

  async close() {
    await this.queue.close();
    Logger.log("Bull queue connection closed", {
      queue: config.bull.queueName,
    });
  }
}
