import type { WhatsAppMessage, WhatsAppWebhookPayload } from "@saaya/whatsapp-types";
import type { InboundMessage, MessageType } from "@saaya/shared";

function mapMessageType(waType: string): MessageType {
  const typeMap: Record<string, MessageType> = {
    text: "text",
    image: "image",
    document: "document",
    audio: "audio",
    video: "video",
    sticker: "sticker",
    location: "location",
  };
  return typeMap[waType] ?? "unknown";
}

export function normalizeWhatsAppMessage(
  message: WhatsAppMessage
): InboundMessage {
  const type = mapMessageType(message.type);

  const normalized: InboundMessage = {
    whatsappMessageId: message.id,
    from: message.from,
    timestamp: message.timestamp,
    type,
  };

  if (message.text) {
    normalized.text = message.text.body;
  }

  if (message.image) {
    normalized.mediaId = message.image.id;
    normalized.mimeType = message.image.mime_type;
    normalized.caption = message.image.caption;
  }

  if (message.document) {
    normalized.mediaId = message.document.id;
    normalized.mimeType = message.document.mime_type;
    normalized.caption = message.document.caption;
  }

  return normalized;
}

export function extractMessages(
  payload: WhatsAppWebhookPayload
): InboundMessage[] {
  const messages: InboundMessage[] = [];

  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value;
      if (!value?.messages) continue;

      for (const message of value.messages) {
        messages.push(normalizeWhatsAppMessage(message));
      }
    }
  }

  return messages;
}

export function hasMessages(payload: WhatsAppWebhookPayload): boolean {
  return extractMessages(payload).length > 0;
}
