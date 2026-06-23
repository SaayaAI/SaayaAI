import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "../../config/env.js";
import { logger } from "../../utils/logger.js";

export function validateWebhookSignature(
  rawBody: string,
  signatureHeader: string | undefined
): boolean {
  if (!env.WEBHOOK_SECRET) {
    if (env.NODE_ENV === "production") {
      logger.warn("WEBHOOK_SECRET not set in production — skipping signature validation");
    }
    return true;
  }

  if (!signatureHeader) {
    logger.warn("Missing X-Hub-Signature-256 header");
    return false;
  }

  const expected =
    "sha256=" +
    createHmac("sha256", env.WEBHOOK_SECRET)
      .update(rawBody, "utf8")
      .digest("hex");

  try {
    return timingSafeEqual(
      Buffer.from(signatureHeader),
      Buffer.from(expected)
    );
  } catch {
    return false;
  }
}
