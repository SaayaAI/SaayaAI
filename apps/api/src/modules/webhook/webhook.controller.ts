import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { WhatsAppWebhookPayload } from "@saaya/whatsapp-types";
import { WebhookProcessStatus } from "@saaya/database";
import { prisma } from "../../config/database.js";
import { env } from "../../config/env.js";
import { logger } from "../../utils/logger.js";
import { validateWebhookSignature } from "./signature.validator.js";
import { isDuplicateMessage } from "./dedupe.service.js";
import { extractMessages, hasMessages } from "./webhook.service.js";
import { enqueueMessageJob } from "../../workers/message.worker.js";

export async function registerWebhookRoutes(app: FastifyInstance): Promise<void> {
  app.get("/webhook", async (request: FastifyRequest, reply: FastifyReply) => {
    const query = request.query as {
      "hub.mode"?: string;
      "hub.verify_token"?: string;
      "hub.challenge"?: string;
    };

    const mode = query["hub.mode"];
    const token = query["hub.verify_token"];
    const challenge = query["hub.challenge"];

    if (mode === "subscribe" && token === env.VERIFY_TOKEN) {
      logger.info("WhatsApp webhook verified");
      return reply.status(200).send(challenge);
    }

    logger.warn({ mode, token }, "Webhook verification failed");
    return reply.status(403).send({ error: "Verification failed" });
  });

  app.post(
    "/webhook",
    { config: { rawBody: true } },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const rawBody =
        (request as FastifyRequest & { rawBody?: string }).rawBody ??
        JSON.stringify(request.body);

      const signature = request.headers["x-hub-signature-256"] as
        | string
        | undefined;

      if (!validateWebhookSignature(rawBody, signature)) {
        return reply.status(401).send({ error: "Invalid signature" });
      }

      const payload = request.body as WhatsAppWebhookPayload;

      if (!hasMessages(payload)) {
        return reply.status(200).send({ status: "ok" });
      }

      let webhookEventId: string | undefined;

      try {
        const event = await prisma.webhookEvent.create({
          data: {
            rawPayload: payload as object,
            status: WebhookProcessStatus.RECEIVED,
          },
        });
        webhookEventId = event.id;
      } catch (error) {
        logger.error({ error }, "Failed to persist webhook event");
      }

      const messages = extractMessages(payload);

      for (const message of messages) {
        if (await isDuplicateMessage(message.whatsappMessageId)) {
          continue;
        }

        await enqueueMessageJob({ message, webhookEventId });
      }

      return reply.status(200).send({ status: "ok" });
    }
  );
}
