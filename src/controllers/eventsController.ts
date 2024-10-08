import { Router, Request, Response } from "express";
import { handleEvent, WorkflowNotFoundError } from "../services/eventHandler";
import { validateEvent } from "../services/eventValidator";
import { Logger } from "../utils/Logger";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  const { eventName, userEmail } = req.body;

  // Validate the incoming event data
  const validationError = validateEvent(eventName, userEmail);
  if (validationError) {
    Logger.error("Validation failed", {
      eventName,
      userEmail,
      error: validationError,
    });
    return res.status(400).json({ error: validationError });
  }

  try {
    // Handle the event, including queue creation and workflow management
    await handleEvent(eventName, userEmail);
    res.status(200).json({ message: "Event received and processing started." });
  } catch (error) {
    if (error instanceof WorkflowNotFoundError) {
      res.status(400).json({ error: error.message });
    } else {
      Logger.error("Event processing failed", { eventName, userEmail, error });
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

export default router;
