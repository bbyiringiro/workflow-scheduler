import { Action } from "./Action";
import { Logger } from "../utils/Logger";
import { sendEmail } from "../utils/sendEmailMock";

export class EmailContent {
  constructor(public subject: string, public body: string) {}
}

/**
 * Represents an email action in the workflow.
 */
export class EmailAction extends Action {
  type: string = "EmailAction";
  constructor(private content: EmailContent) {
    super();
  }

  async execute(): Promise<void> {
    Logger.log(`Sending email`, { subject: this.content.subject });
    const success = await sendEmail();

    if (success) {
      Logger.log(`Email sent successfully`, { subject: this.content.subject });
    } else {
      Logger.error(`Failed to send email`, { subject: this.content.subject });
      throw new Error("Email failed to send");
    }
  }

  serialize() {
    return {
      type: this.type,
      content: this.content,
    };
  }

  static deserialize(data: any): EmailAction {
    return new EmailAction(
      new EmailContent(data.content.subject, data.content.body)
    );
  }
}
