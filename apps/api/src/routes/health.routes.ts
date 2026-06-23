import type { FastifyInstance } from "fastify";
import { prisma } from "../config/database.js";
import { getRedis } from "../config/redis.js";
import { checkOpenAIHealth } from "../modules/ai/chat.service.js";
import { checkWhatsAppHealth } from "../modules/whatsapp/whatsapp.client.js";

export async function registerHealthRoutes(app: FastifyInstance): Promise<void> {
  app.get("/", async () => ({
    name: "Saaya AI",
    status: "running",
    version: "0.1.0",
  }));

  app.get("/health", async () => ({
    status: "ok",
    timestamp: new Date().toISOString(),
  }));

  app.get("/health/ready", async (_request, reply) => {
    const checks = {
      postgres: false,
      redis: false,
      openai: false,
      whatsapp: false,
    };

    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.postgres = true;
    } catch {
      /* postgres unavailable */
    }

    try {
      const redis = getRedis();
      await redis.ping();
      checks.redis = true;
    } catch {
      /* redis unavailable */
    }

    checks.openai = await checkOpenAIHealth();
    checks.whatsapp = await checkWhatsAppHealth();

    const allHealthy = Object.values(checks).every(Boolean);
    const status = allHealthy ? "ready" : "degraded";

    return reply.status(allHealthy ? 200 : 503).send({
      status,
      checks,
      timestamp: new Date().toISOString(),
    });
  });
}
