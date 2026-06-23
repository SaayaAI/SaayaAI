import { getRedis } from "../../config/redis.js";
import { DEDUPE_TTL_SECONDS, REDIS_KEYS } from "@saaya/shared";
import { logger } from "../../utils/logger.js";

export async function isDuplicateMessage(messageId: string): Promise<boolean> {
  const redis = getRedis();
  const key = REDIS_KEYS.dedupe(messageId);

  const result = await redis.set(key, "1", "EX", DEDUPE_TTL_SECONDS, "NX");
  const isDuplicate = result === null;

  if (isDuplicate) {
    logger.debug({ messageId }, "Duplicate message skipped");
  }

  return isDuplicate;
}
