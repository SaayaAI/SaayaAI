import Redis from "ioredis";
import { env } from "./env.js";
import { logger } from "../utils/logger.js";

let redis: Redis | null = null;

export function getRedis(): Redis {
  if (!redis) {
    redis = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: true,
      lazyConnect: true,
    });

    redis.on("error", (err) => {
      logger.error({ err }, "Redis connection error");
    });

    redis.on("connect", () => {
      logger.info("Redis connected");
    });
  }

  return redis;
}

export async function connectRedis(): Promise<void> {
  const client = getRedis();
  if (client.status === "ready") return;
  await client.connect();
}

export async function disconnectRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
    logger.info("Redis disconnected");
  }
}

export function createRedisConnection(): Redis {
  return new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
  });
}
