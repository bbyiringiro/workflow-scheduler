import { IQueue } from "./IQueue";
import { RabbitMQQueue } from "./rabbitmqQueue";
import { BullQueue } from "./bullQueue";

export class QueueFactory {
  static createQueue(type: string): IQueue {
    switch (type) {
      case "rabbitmq":
        return new RabbitMQQueue();
      case "bull":
        return new BullQueue();
      default:
        throw new Error(`Queue type ${type} is not supported`);
    }
  }
}
