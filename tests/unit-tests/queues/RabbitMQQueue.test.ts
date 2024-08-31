import { RabbitMQQueue } from "../../../src/queues/rabbitmqQueue";
import amqp from "amqplib";
import { Logger } from "../../../src/utils/Logger";

// Mock dependencies
jest.mock("amqplib");
jest.mock("../../../src/utils/Logger");

describe("RabbitMQQueue", () => {
  let queue: RabbitMQQueue;
  let mockChannel: any;
  let mockConnection: any;

  beforeEach(async () => {
    jest.clearAllMocks();

    mockChannel = {
      assertQueue: jest.fn(),
      sendToQueue: jest.fn(),
      consume: jest.fn(),
      ack: jest.fn(),
      nack: jest.fn(),
    };

    mockConnection = {
      createChannel: jest.fn().mockResolvedValue(mockChannel),
    };

    (amqp.connect as jest.Mock).mockResolvedValue(mockConnection);

    queue = new RabbitMQQueue("testQueue");
    await queue.connect();
  });

  it("should enqueue a message", async () => {
    await queue.enqueue({ key: "value" });

    expect(amqp.connect).toHaveBeenCalled();
    expect(mockChannel.sendToQueue).toHaveBeenCalledWith(
      "testQueue",
      Buffer.from(JSON.stringify({ key: "value", retryCount: 0 })),
      { persistent: true }
    );
    expect(Logger.log).toHaveBeenCalledWith("Enqueued message to RabbitMQ", {
      queue: "testQueue",
      data: { key: "value" },
    });
  });

  it("should process messages", async () => {
    const handler = jest.fn();
    await queue.process("testQueue", handler);

    const mockMsg = {
      content: Buffer.from(JSON.stringify({ key: "value" })),
    };

    mockChannel.consume.mock.calls[0][1](mockMsg);

    expect(handler).toHaveBeenCalledWith({ key: "value" });
    // expect(mockChannel.ack).toHaveBeenCalledWith(mockMsg);
  });

  // it("should retry processing messages on failure", async () => {
  //   const handler = jest
  //     .fn()
  //     .mockRejectedValueOnce(new Error("Failed"))
  //     .mockResolvedValueOnce(undefined);
  //   await queue.process("testQueue", handler);

  //   const mockMsg = {
  //     content: Buffer.from(JSON.stringify({ key: "value", retryCount: 0 })),
  //   };

  //   // Manually trigger the callback for consuming a message
  //   mockChannel.consume.mock.calls[0][1](mockMsg);

  //   expect(mockChannel.ack).not.toHaveBeenCalled();
  //   expect(mockChannel.nack).toHaveBeenCalledWith(mockMsg);

  //   // Simulate the message being retried
  //   const retriedMsg = {
  //     content: Buffer.from(JSON.stringify({ key: "value", retryCount: 1 })),
  //   };
  //   mockChannel.consume.mock.calls[0][1](retriedMsg);

  //   expect(handler).toHaveBeenCalledTimes(2);
  //   expect(mockChannel.ack).toHaveBeenCalledWith(retriedMsg);
  // });
});
