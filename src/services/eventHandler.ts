import { getWorkflowForEvent } from "../registries/WorkflowRegistry";
import { Logger } from "../utils/Logger";
import { IQueue } from "../queues/IQueue";

export class WorkflowNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WorkflowNotFoundError";
  }
}

export const handleEvent = async (
  eventName: string,
  userEmail: string,
  queue: IQueue
): Promise<void> => {
  const workflow = getWorkflowForEvent(eventName, userEmail);

  if (!workflow) {
    Logger.warn("No workflow found", { eventName, userEmail });
    throw new WorkflowNotFoundError(
      "No workflow found for the specified event"
    );
  }

  const workflowData = workflow.serialize();
  await queue.enqueue(workflowData); 

  Logger.log("Event enqueued", {
    eventName,
    userEmail,
    workflowId: workflow.getId(),
  });
};
