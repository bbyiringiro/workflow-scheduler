import { IQueue } from "./IQueue";
import { RabbitMQQueue } from "./rabbitmqQueue";
import { BullQueue } from "./bullQueue";

export class QueueFactory {
  static async createQueue(type: string, queueName: string): Promise<IQueue> {
    switch (type) {
      case "rabbitmq":
        return new RabbitMQQueue(queueName);
      case "bull":
        return new BullQueue(queueName);
      default:
        throw new Error(`Queue type ${type} is not supported`);
    }
  }
}
