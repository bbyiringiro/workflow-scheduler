import {
  handleEvent,
  WorkflowNotFoundError,
} from "../../../src/services/eventHandler";
import { QueueFactory } from "../../../src/queues/QueueFactory";
import { getWorkflowForEvent } from "../../../src/registries/WorkflowRegistry";
import { Logger } from "../../../src/utils/Logger";

// Mock dependencies
jest.mock("../../../src/queues/QueueFactory");
jest.mock("../../../src/registries/WorkflowRegistry");
jest.mock("../../../src/utils/Logger");

describe("handleEvent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should throw WorkflowNotFoundError if no workflow is found", async () => {
    (getWorkflowForEvent as jest.Mock).mockReturnValue(null);

    await expect(handleEvent("eventName", "user@example.com")).rejects.toThrow(
      WorkflowNotFoundError
    );
    expect(Logger.warn).toHaveBeenCalledWith("No workflow found", {
      eventName: "eventName",
      userEmail: "user@example.com",
    });
  });

  it("should enqueue a workflow if found", async () => {
    const mockWorkflow = {
      serialize: jest.fn().mockReturnValue({}),
      getId: jest.fn().mockReturnValue("workflowId"),
    };
    const mockQueue = {
      connect: jest.fn(),
      enqueue: jest.fn(),
      process: jest.fn(),
    };

    (getWorkflowForEvent as jest.Mock).mockReturnValue(mockWorkflow);
    (QueueFactory.createQueue as jest.Mock).mockResolvedValue(mockQueue);

    await handleEvent("eventName", "user@example.com");

    expect(mockQueue.connect).toHaveBeenCalled();
    expect(mockQueue.enqueue).toHaveBeenCalledWith(expect.any(Object));
  });
});
