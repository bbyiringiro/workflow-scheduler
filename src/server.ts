import app from "./app";
import { Logger } from "./utils/Logger";
import config from "./config";

const startServer = async () => {
  try {
    app.listen(config.server.port, () =>
      Logger.log(`Server running on port ${config.server.port}`)
    );
  } catch (error) {
    Logger.error("Failed to start server", { error });
    process.exit(1);
  }
};

startServer();
