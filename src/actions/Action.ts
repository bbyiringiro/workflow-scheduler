export interface IAction {
  execute(): Promise<void>;
}

export abstract class Action implements IAction {
  abstract execute(): Promise<void>;

  abstract serialize(): any;
  static deserialize(data: any): Action {
    throw new Error(
      "Deserialize method should be implemented in derived classes"
    );
  }
}
