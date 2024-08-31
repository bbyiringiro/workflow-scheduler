import express from "express";
import config from "./config";
import eventsRouter from "./controllers/eventsController";

const app = express();

app.use(express.json());
app.use("/api/event", eventsRouter);

app.listen(config.server.port, () => {
  console.log(`Server running on port ${config.server.port}`);
});

export default app;
