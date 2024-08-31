import dotenv from "dotenv";

const env = process.env.NODE_ENV || "development";
dotenv.config({ path: `.env.${env}` });

export default {
  server: {
    port: parseInt(process.env.PORT || "3000", 10),
  },

  queue: {
    type: process.env.QUEUE_TYPE || "rabbitmq",
    retry: {
      maxRetries: parseInt(process.env.QUEUE_MAX_RETRIES || "3", 10),
      retryDelay: parseInt(process.env.QUEUE_RETRY_DELAY || "5000", 10),
    },
  },
  rabbitmq: {
    url: process.env.RABBITMQ_URL || "amqp://rabbitmq",
  },
  redis: {
    host: process.env.REDIS_HOST || "redis",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
  },
};
