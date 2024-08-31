import express from "express";
import eventsRouter from "./controllers/eventsController";
import config from "./config";

const app = express();

app.use(express.json());
app.use("/api/event", eventsRouter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).send("Server is healthy");
});

export default app;
