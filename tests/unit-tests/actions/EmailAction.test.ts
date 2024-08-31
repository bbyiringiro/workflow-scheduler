import { EmailAction, EmailContent } from "../../../src/actions/EmailAction";
import { Logger } from "../../../src/utils/Logger";
import { sendEmail } from "../../../src/utils/sendEmailMock";

jest.mock("../../../src/utils/sendEmailMock", () => ({
  sendEmail: jest.fn(),
}));

jest.spyOn(Logger, "log").mockImplementation(() => {});
jest.spyOn(Logger, "error").mockImplementation(() => {});

describe("EmailAction", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should send an email successfully", async () => {
    (sendEmail as jest.Mock).mockResolvedValue(true);

    const emailAction = new EmailAction(new EmailContent("Subject", "Body"));
    await emailAction.execute();

    expect(Logger.log).toHaveBeenCalledWith("Sending email", {
      subject: "Subject",
    });
    expect(Logger.log).toHaveBeenCalledWith("Email sent successfully", {
      subject: "Subject",
    });
    expect(sendEmail).toHaveBeenCalledTimes(1);
  });

  it("should log an error if email sending fails", async () => {
    (sendEmail as jest.Mock).mockResolvedValue(false);

    const emailAction = new EmailAction(new EmailContent("Subject", "Body"));
    await expect(emailAction.execute()).rejects.toThrow("Email failed to send");

    expect(Logger.error).toHaveBeenCalledWith("Failed to send email", {
      subject: "Subject",
    });
    expect(sendEmail).toHaveBeenCalledTimes(1);
  });
});
