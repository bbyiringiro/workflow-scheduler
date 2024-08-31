import { Workflow } from "../../../src/models/Workflow";
import { EmailAction, EmailContent } from "../../../src/actions/EmailAction";
import { TimerAction, TimerContent } from "../../../src/actions/TimerAction";
import { Logger } from "../../../src/utils/Logger";

jest.spyOn(Logger, "log");
jest.spyOn(Logger, "error");

describe("Workflow", () => {
  it("should execute all actions in the workflow", async () => {
    const workflow = new Workflow("Test Workflow", "user@example.com");
    workflow.addAction(new EmailAction(new EmailContent("Subject", "Body")));
    workflow.addAction(new TimerAction(new TimerContent(1000)));

    await workflow.run();

    expect(Logger.log).toHaveBeenCalledWith("Running workflow", {
      id: workflow.getId(),
      name: "Test Workflow",
    });
    expect(Logger.log).toHaveBeenCalledWith("Action executed", {
      id: workflow.getId(),
      action: "EmailAction",
    });
    expect(Logger.log).toHaveBeenCalledWith("Action executed", {
      id: workflow.getId(),
      action: "TimerAction",
    });
  });

  it("should stop and log an error if an action fails", async () => {
    const workflow = new Workflow("Test Workflow", "user@example.com");
    workflow.addAction(new EmailAction(new EmailContent("Subject", "Body")));
    workflow.addAction(new TimerAction(new TimerContent(1000)));

    jest.spyOn(EmailAction.prototype, "execute").mockImplementationOnce(() => {
      throw new Error("Mock Error");
    });

    await expect(workflow.run()).rejects.toThrow("Mock Error");

    expect(Logger.error).toHaveBeenCalledWith("Action failed", {
      id: workflow.getId(),
      action: "EmailAction",
      error: expect.any(Error),
    });
  });
});
