import { Action } from "./Action";
import { Logger } from "../utils/Logger";

export class TimerContent {
  constructor(public duration: number) {}
}

/**
 * Represents a timer action in the workflow.
 */
export class TimerAction extends Action {
  type: string = "TimerAction";
  constructor(private content: TimerContent) {
    super();
  }

  async execute(): Promise<void> {
    Logger.log(`Waiting for ${this.content.duration}ms`);
    return new Promise((resolve) => setTimeout(resolve, this.content.duration));
  }

  serialize() {
    return {
      type: this.type,
      content: {
        duration: this.content.duration,
      },
    };
  }

  static deserialize(data: any): TimerAction {
    return new TimerAction(new TimerContent(data.content.duration));
  }
}
