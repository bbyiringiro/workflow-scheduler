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

  getActions(): Action[] {
    return this.actions;
  }

  getId(): string {
    return this.id;
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

  // Method to serialize the workflow into a plain object
  serialize(): any {
    return {
      id: this.id,
      name: this.name,
      userEmail: this.userEmail,
      actions: this.actions.map((action) => action.serialize()),
    };
  }

  static fromData(data: any): Workflow {
    if (!data || typeof data !== "object") {
      throw new Error("Invalid workflow data provided.");
    }

    const workflow = new Workflow(data.name, data.userEmail, data.id);
    workflow.actions = data.actions.map(Workflow.deserializeAction);
    return workflow;
  }

  static deserializeAction(data: any): Action {
    switch (data.type) {
      case "EmailAction":
        return EmailAction.deserialize(data);
      case "TimerAction":
        return TimerAction.deserialize(data);
      default:
        throw new Error(`Unknown action type: ${data.type}`);
    }
  }
}
