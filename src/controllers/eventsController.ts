import { Router, Request, Response } from "express";
import { Logger } from "../utils/Logger";
import { validateEvent } from "../services/eventValidator";

const router = Router();

// health check
router.get("/", (_, res) => {
  res.status(200).send("Event API is running!");
});

router.post("/", async (req: Request, res: Response) => {
  const { eventName, userEmail } = req.body;
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
    res.status(200).json({ message: "Event received and processing started." });
  } catch (error) {
    Logger.error("Event processing failed", { eventName, userEmail, error });
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
