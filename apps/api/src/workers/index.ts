import { Worker } from "bullmq";
import { QUEUE_NAMES } from "@saaya/shared";
import { connectDatabase, disconnectDatabase } from "../config/database.js";
import { connectRedis, createRedisConnection, disconnectRedis } from "../config/redis.js";
import { routeMessage } from "../modules/router/message.router.js";
import { logger } from "../utils/logger.js";
import type { MessageJobData } from "./message.worker.js";

async function startWorker(): Promise<void> {
  await connectDatabase();
  await connectRedis();

  const worker = new Worker<MessageJobData>(
    QUEUE_NAMES.MESSAGES,
    async (job) => {
      const { message, webhookEventId } = job.data;
      await routeMessage(message, webhookEventId);
    },
    {
      connection: createRedisConnection(),
      concurrency: 5,
    }
  );

  worker.on("completed", (job) => {
    logger.debug({ jobId: job.id }, "Message job completed");
  });

  worker.on("failed", (job, err) => {
    logger.error({ jobId: job?.id, err }, "Message job failed");
  });

  logger.info("Message worker started");

  const shutdown = async (signal: string) => {
    logger.info({ signal }, "Shutting down worker");
    await worker.close();
    await disconnectDatabase();
    await disconnectRedis();
    process.exit(0);
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

startWorker().catch((err) => {
  logger.fatal({ err }, "Worker failed to start");
  process.exit(1);
});
