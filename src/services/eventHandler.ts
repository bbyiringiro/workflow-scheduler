import { getWorkflowForEvent } from "../registries/WorkflowRegistry";
import { Logger } from "../utils/Logger";
import { QueueFactory } from "../queues/QueueFactory";
import config from "../config";
import { Workflow } from "../models/Workflow";

export class WorkflowNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WorkflowNotFoundError";
  }
}

export const handleEvent = async (
  eventName: string,
  userEmail: string
): Promise<void> => {
  const workflow = getWorkflowForEvent(eventName, userEmail);

  if (!workflow) {
    Logger.warn("No workflow found", { eventName, userEmail });
    throw new WorkflowNotFoundError(
      "No workflow found for the specified event"
    );
  }

  const eventQueue = await QueueFactory.createQueue(
    config.queue.type,
    eventName
  );
  await eventQueue.connect(); // Ensure the connection is established

  const workflowData = workflow.serialize();
  await eventQueue.enqueue(workflowData);

  Logger.log("Event enqueued", {
    eventName,
    userEmail,
    workflowId: workflow.getId(),
  });

  // Process the queue for this specific event
  eventQueue.process(eventName, async (data) => {
    try {
      const workflow = Workflow.fromData(data);
      await workflow.run();
      Logger.log("Workflow processed successfully", {
        workflowId: workflow.getId(),
      });
    } catch (error) {
      Logger.error("Failed to process workflow", { error });
    }
  });
};
