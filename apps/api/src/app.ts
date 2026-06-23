import Fastify from "fastify";
import cors from "@fastify/cors";
import { env } from "./config/env.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";
import { connectRedis, disconnectRedis } from "./config/redis.js";
import { registerWebhookRoutes } from "./modules/webhook/webhook.controller.js";
import { registerHealthRoutes } from "./routes/health.routes.js";
import { registerErrorHandler } from "./middleware/error.middleware.js";
import { closeMessageQueue } from "./workers/message.worker.js";
import { logger } from "./utils/logger.js";

export async function buildApp() {
  const app = Fastify({
    logger: false,
    bodyLimit: 1048576,
  });

  app.addContentTypeParser(
    "application/json",
    { parseAs: "string" },
    (req, body, done) => {
      try {
        (req as typeof req & { rawBody: string }).rawBody = body as string;
        done(null, JSON.parse(body as string));
      } catch (err) {
        done(err as Error, undefined);
      }
    }
  );

  await app.register(cors, {
    origin: env.NODE_ENV === "development" ? true : false,
    credentials: true,
  });

  registerErrorHandler(app);
  await registerHealthRoutes(app);
  await registerWebhookRoutes(app);

  return app;
}

export async function startServer(): Promise<void> {
  await connectDatabase();
  await connectRedis();

  const app = await buildApp();

  await app.listen({ port: env.PORT, host: "0.0.0.0" });
  logger.info({ port: env.PORT, env: env.NODE_ENV }, "Saaya AI API started");

  const shutdown = async (signal: string) => {
    logger.info({ signal }, "Shutting down API");
    await app.close();
    await closeMessageQueue();
    await disconnectDatabase();
    await disconnectRedis();
    process.exit(0);
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}
