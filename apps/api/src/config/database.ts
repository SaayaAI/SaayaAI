import { prisma } from "@saaya/database";
import { logger } from "../utils/logger.js";

export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    logger.info("PostgreSQL connected");
  } catch (error) {
    logger.error({ error }, "Failed to connect to PostgreSQL");
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  logger.info("PostgreSQL disconnected");
}

export { prisma };
