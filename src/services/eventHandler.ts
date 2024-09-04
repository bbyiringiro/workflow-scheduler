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

  const workFlowQueueName = eventName + "-" + workflow.getId();
  const eventQueue = await QueueFactory.createQueue(
    config.queue.type,
    workFlowQueueName
  );
  await eventQueue.connect(); // Ensure the connection is established

  Logger.log("Queue connected", { queueName: workFlowQueueName });

  const actions = workflow.getActions();
  if (actions.length > 0) {
    Logger.log("Enqueueing initial action", {
      actionType: actions[0].constructor.name,
      workflowId: workflow.getId(),
    });
    await eventQueue.enqueue({
      action: actions[0].serialize(),
      workflowId: workflow.getId(),
      index: 0,
    });
  }

  eventQueue.process(workFlowQueueName, async (data) => {
    const action = Workflow.deserializeAction(data.action);
    Logger.log("Processing action", {
      actionType: action.constructor.name,
      index: data.index,
      workflowId: data.workflowId,
    });

    try {
      await action.execute();
      Logger.log("Action executed successfully", {
        actionType: action.constructor.name,
        index: data.index,
        workflowId: data.workflowId,
      });

      const nextIndex = data.index + 1;
      if (nextIndex < actions.length) {
        Logger.log("Enqueueing next action", {
          actionType: actions[nextIndex].constructor.name,
          index: nextIndex,
          workflowId: data.workflowId,
        });
        await eventQueue.enqueue({
          action: actions[nextIndex].serialize(),
          workflowId: data.workflowId,
          index: nextIndex,
        });
      } else {
        Logger.log("Workflow completed", { workflowId: data.workflowId });
      }
    } catch (error) {
      Logger.error("Action execution failed", {
        actionType: action.constructor.name,
        index: data.index,
        workflowId: data.workflowId,
        error,
      });
      throw error;
    }
  });
};
