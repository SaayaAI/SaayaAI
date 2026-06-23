import { env } from "../../config/env.js";
import type {
  WhatsAppSendMessagePayload,
  WhatsAppMediaUrlResponse,
  WhatsAppApiError,
} from "@saaya/whatsapp-types";
import { logger } from "../../utils/logger.js";

const GRAPH_API_BASE = "https://graph.facebook.com/v21.0";

function getHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${env.WHATSAPP_TOKEN}`,
    "Content-Type": "application/json",
  };
}

export async function sendTextMessage(
  to: string,
  body: string
): Promise<void> {
  const url = `${GRAPH_API_BASE}/${env.PHONE_NUMBER_ID}/messages`;

  const payload: WhatsAppSendMessagePayload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "text",
    text: {
      preview_url: false,
      body: body.slice(0, 4096),
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = (await response.json()) as WhatsAppApiError;
    logger.error(
      { status: response.status, error },
      "Failed to send WhatsApp message"
    );
    throw new Error(
      error.error?.message ?? "WhatsApp send message failed"
    );
  }

  logger.debug({ to }, "WhatsApp message sent");
}

export async function getMediaUrl(
  mediaId: string
): Promise<WhatsAppMediaUrlResponse> {
  const url = `${GRAPH_API_BASE}/${mediaId}`;

  const response = await fetch(url, { headers: getHeaders() });

  if (!response.ok) {
    throw new Error(`Failed to get media URL for ${mediaId}`);
  }

  return response.json() as Promise<WhatsAppMediaUrlResponse>;
}

export async function downloadMedia(mediaId: string): Promise<Buffer> {
  const { url } = await getMediaUrl(mediaId);

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${env.WHATSAPP_TOKEN}` },
  });

  if (!response.ok) {
    throw new Error(`Failed to download media ${mediaId}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function checkWhatsAppHealth(): Promise<boolean> {
  try {
    const url = `${GRAPH_API_BASE}/${env.PHONE_NUMBER_ID}`;
    const response = await fetch(url, { headers: getHeaders() });
    return response.ok;
  } catch {
    return false;
  }
}
