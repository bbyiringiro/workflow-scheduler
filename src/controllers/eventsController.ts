import { Router, Request, Response } from "express";
import { Logger } from "../utils/Logger";

const router = Router();

// health check
router.get("/", (_, res) => {
  res.status(200).send("Event API is running!");
});

router.post("/", async (req: Request, res: Response) => {
  const { eventName, userEmail } = req.body;

  try {
    res.status(200).json({ message: "Event received and processing started." });
  } catch (error) {
    Logger.error("Event processing failed", { eventName, userEmail, error });
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
