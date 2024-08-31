import { Action } from "../actions/Action";
import { EmailAction } from "../actions/EmailAction";
import { TimerAction } from "../actions/TimerAction";
import { Logger } from "../utils/Logger";
import { generateUniqueId } from "../utils/uniqueId";

export class Workflow {
  private actions: Action[] = [];
  private id: string;

  constructor(public name: string, public userEmail: string, id?: string) {
    this.id = id || generateUniqueId();
    Logger.log(`Workflow created`, { id: this.id, name, userEmail });
  }

  addAction(action: Action) {
    this.actions.push(action);
  }

  async run(): Promise<void> {
    Logger.log(`Running workflow`, { id: this.id, name: this.name });
    for (const action of this.actions) {
      try {
        await action.execute();
        Logger.log(`Action executed`, {
          id: this.id,
          action: action.constructor.name,
        });
      } catch (error) {
        Logger.error(`Action failed`, {
          id: this.id,
          action: action.constructor.name,
          error,
        });
        throw error; // Propagate the error
      }
    }
  }

  static fromData(data: any): Workflow {
    if (!data || typeof data !== "object") {
      throw new Error("Invalid workflow data provided.");
    }

    const workflow = new Workflow(data.name, data.userEmail, data.id);
    // Logger.log("Deserializing workflow", { id: workflow.getId(), data });

    if (Array.isArray(data.actions)) {
      for (const actionData of data.actions) {
        let action: Action;
        switch (actionData.type) {
          case "EmailAction":
            action = EmailAction.deserialize(actionData);
            break;
          case "TimerAction":
            action = TimerAction.deserialize(actionData);
            break;
          default:
            throw new Error(`Unknown action type: ${actionData.type}`);
        }
        workflow.addAction(action);
      }
    } else {
      throw new Error("Invalid actions data. Expected an array of actions.");
    }

    return workflow;
  }

  // Method to serialize the workflow into a plain object
  serialize(): any {
    return {
      id: this.id,
      name: this.name,
      userEmail: this.userEmail,
      actions: this.actions.map((action) => action.serialize()),
    };
  }

  getId(): string {
    return this.id;
  }
}
