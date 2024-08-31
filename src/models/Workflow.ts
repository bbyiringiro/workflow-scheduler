import { Action } from "../actions/Action";
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
      await action.execute();
      Logger.log(`Action executed`, {
        id: this.id,
        action: action.constructor.name,
      });
    }
  }

  getId(): string {
    return this.id;
  }
}
