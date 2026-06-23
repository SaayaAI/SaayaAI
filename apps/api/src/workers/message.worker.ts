import { Queue } from "bullmq";
import type { InboundMessage } from "@saaya/shared";
import { QUEUE_NAMES } from "@saaya/shared";
import { createRedisConnection } from "../config/redis.js";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

export interface MessageJobData {
  message: InboundMessage;
  webhookEventId?: string;
}

let messageQueue: Queue<MessageJobData> | null = null;

export function getMessageQueue(): Queue<MessageJobData> {
  if (!messageQueue) {
    messageQueue = new Queue<MessageJobData>(QUEUE_NAMES.MESSAGES, {
      connection: createRedisConnection(),
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 1000 },
        removeOnComplete: { count: 1000 },
        removeOnFail: { count: 5000 },
      },
    });
  }
  return messageQueue;
}

export async function enqueueMessageJob(data: MessageJobData): Promise<void> {
  const queue = getMessageQueue();
  await queue.add("process-message", data, {
    jobId: data.message.whatsappMessageId,
  });
  logger.debug(
    { messageId: data.message.whatsappMessageId },
    "Message job enqueued"
  );
}

export async function closeMessageQueue(): Promise<void> {
  if (messageQueue) {
    await messageQueue.close();
    messageQueue = null;
  }
}
