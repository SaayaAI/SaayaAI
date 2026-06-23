import type { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { logger } from "../utils/logger.js";

export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler(
    (error: FastifyError, _request: FastifyRequest, reply: FastifyReply) => {
      logger.error({ err: error }, "Request error");

      const statusCode = error.statusCode ?? 500;
      const message =
        statusCode >= 500 ? "Internal server error" : error.message;

      reply.status(statusCode).send({
        error: message,
        statusCode,
      });
    }
  );

  app.setNotFoundHandler((_request, reply) => {
    reply.status(404).send({ error: "Not found" });
  });
}
