// src/actions/TimerAction.ts
import { Action } from "./Action";
import { Logger } from "../utils/Logger";

export class TimerContent {
  constructor(public duration: number) {}
}

export class TimerAction extends Action {
  constructor(private content: TimerContent) {
    super();
  }

  async execute(): Promise<void> {
    Logger.log(`Waiting for ${this.content.duration}ms`);
    return new Promise((resolve) => setTimeout(resolve, this.content.duration));
  }
}
