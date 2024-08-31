export interface IAction {
  execute(): Promise<void>;
}

export abstract class Action implements IAction {
  abstract execute(): Promise<void>;
}
