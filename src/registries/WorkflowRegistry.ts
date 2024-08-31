// src/registry/workflowRegistry.ts
import { Workflow } from "../models/Workflow";
import { EmailAction, EmailContent } from "../actions/EmailAction";
import { TimerAction, TimerContent } from "../actions/TimerAction";

const registry: Record<string, (userEmail: string) => Workflow> = {
  websiteSignup: createWebsiteSignupWorkflow,
  socksPurchased: createSocksPurchasedWorkflow,
};

function createWebsiteSignupWorkflow(userEmail: string): Workflow {
  const workflow = new Workflow("Website Signup Workflow", userEmail);
  workflow.addAction(
    new EmailAction(new EmailContent("Welcome!", "Thank you for signing up."))
  );
  workflow.addAction(new TimerAction(new TimerContent(2 * 60 * 60 * 1000))); // 2 hours
  workflow.addAction(
    new EmailAction(new EmailContent("Follow Up", "Here is a follow-up email."))
  );
  return workflow;
}

function createSocksPurchasedWorkflow(userEmail: string): Workflow {
  const workflow = new Workflow("Socks Purchased Workflow", userEmail);
  workflow.addAction(
    new EmailAction(
      new EmailContent(
        "Purchase Confirmation",
        "Thank you for your purchase of socks! Your order will be processed shortly."
      )
    )
  );
  workflow.addAction(
    new EmailAction(
      new EmailContent(
        "Shipping Notification",
        "Your socks have been shipped and are on their way!"
      )
    )
  );
  return workflow;
}

export const getWorkflowForEvent = (
  eventName: string,
  userEmail: string
): Workflow | null => {
  const factory = registry[eventName];
  if (!factory) {
    console.warn(`No workflow found for event: ${eventName}`);
    return null;
  }
  return factory(userEmail);
};
