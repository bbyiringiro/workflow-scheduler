import { Action } from "./Action";
import { Logger } from "../utils/Logger";
import { sendEmail } from "../utils/sendEmailMock";

export class EmailContent {
  constructor(public subject: string, public body: string) {}
}

export class EmailAction extends Action {
  constructor(private content: EmailContent) {
    super();
  }

  async execute(): Promise<void> {
    Logger.log(`Sending email`, { subject: this.content.subject });
    // TODO
  }
}
