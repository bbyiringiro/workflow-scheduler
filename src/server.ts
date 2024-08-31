import app from "./app";
import { QueueFactory } from "./queues/QueueFactory";
import config from "./config";
import { Logger } from "./utils/Logger";
import { Workflow } from "./models/Workflow";

const startServer = async () => {
  const queue = QueueFactory.createQueue(config.queue.type);
  if (queue.connect) {
    await queue.connect();
  }
  app.set("queue", queue);

  queue.process(async (data) => {
    const workflow = Workflow.fromData(data); // Assuming fromData method exists
    await workflow.run();
    Logger.log("Workflow processed successfully", {
      workflowId: workflow.getId(),
    });
  });

  app.listen(config.server.port, () =>
    Logger.log(`Server running on port ${config.server.port}`)
  );
};

startServer().catch((error) => {
  Logger.error("Failed to start server", { error });
  process.exit(1);
});
