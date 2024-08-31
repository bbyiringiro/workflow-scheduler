import dotenv from "dotenv";

dotenv.config();

export default {
  server: {
    port: parseInt(process.env.PORT || "3000", 10),
  },
  queue: {
    type: process.env.QUEUE_TYPE || "bull", // Default
    name: "workflowQueue",
  },
  rabbitmq: {
    url: process.env.RABBITMQ_URL || "amqp://rabbitmq:5672",
    maxRetries: parseInt(process.env.RABBITMQ_MAX_RETRIES || "5", 10),
    retryDelay: parseInt(process.env.RABBITMQ_RETRY_DELAY || "5000", 10),
  },
  bull: {
    queueName: process.env.BULL_QUEUE_NAME || "workflowQueue",
  },
  redis: {
    host: process.env.REDIS_HOST || "redis",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
  },
};
