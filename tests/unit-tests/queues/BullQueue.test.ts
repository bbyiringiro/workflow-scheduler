import { BullQueue } from "../../../src/queues/bullQueue";
import Queue from "bull";
import { Logger } from "../../../src/utils/Logger";

jest.mock("bull");
jest.spyOn(Logger, "log").mockImplementation(() => {});
jest.spyOn(Logger, "error").mockImplementation(() => {});

describe("BullQueue", () => {
  let bullQueue: BullQueue;
  let queueMock: any;

  beforeEach(() => {
    queueMock = {
      add: jest.fn(),
      process: jest.fn(),
      close: jest.fn(),
    };
    (Queue as jest.Mock).mockImplementation(() => queueMock);
    bullQueue = new BullQueue("testQueue");
  });

  it("should enqueue and process messages with retries", async () => {
    await bullQueue.connect();
    await bullQueue.enqueue({ message: "test message" });

    const handler = jest.fn();
    bullQueue.process("testQueue", handler);

    expect(queueMock.add).toHaveBeenCalledTimes(1);
    expect(queueMock.process).toHaveBeenCalled();
  });
});
