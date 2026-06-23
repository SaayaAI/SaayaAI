import type { InboundMessage } from "@saaya/shared";
import { CREATOR_REPLY } from "@saaya/shared";
import { MessageDirection, MessageType, WebhookProcessStatus } from "@saaya/database";
import { prisma } from "../../config/database.js";
import { generateChatResponse } from "../ai/chat.service.js";
import { sendTextMessage } from "../whatsapp/whatsapp.client.js";
import { findOrCreateUser, logMessage } from "../users/user.service.js";
import { buildConversationContext } from "../memory/context.engine.js";
import { appendExchange } from "../memory/session.store.js";
import {
  extractAndProcessMemories,
  isCreatorQuestion,
} from "../memory/memory.extractor.js";
import { inferMemoriesFromExchange } from "../memory/memory.inference.js";
import { analyzeMessage } from "./message.analyzer.js";
import { logger } from "../../utils/logger.js";

export async function routeMessage(
  message: InboundMessage,
  webhookEventId?: string
): Promise<void> {
  const user = await findOrCreateUser(message.from);

  if (message.type === "text" && message.text) {
    await handleTextMessage(user.id, message.from, message);
  } else if (message.type === "image") {
    await sendTextMessage(
      message.from,
      "📷 Photo analysis Phase 2 me aayega. Abhi text messages bhejo!"
    );
    await logMessage({
      userId: user.id,
      direction: MessageDirection.INBOUND,
      type: MessageType.IMAGE,
      whatsappId: message.whatsappMessageId,
    });
  } else if (message.type === "document") {
    await sendTextMessage(
      message.from,
      "📄 Document analysis Phase 2 me aayega. Abhi text messages bhejo!"
    );
    await logMessage({
      userId: user.id,
      direction: MessageDirection.INBOUND,
      type: MessageType.DOCUMENT,
      whatsappId: message.whatsappMessageId,
    });
  } else {
    await sendTextMessage(
      message.from,
      "Abhi sirf text messages support hain. Kuch likh kar bhejo!"
    );
  }

  if (webhookEventId) {
    await prisma.webhookEvent
      .update({
        where: { id: webhookEventId },
        data: {
          status: WebhookProcessStatus.PROCESSED,
          processedAt: new Date(),
        },
      })
      .catch((err) => logger.error({ err }, "Failed to update webhook event"));
  }
}

async function handleTextMessage(
  userId: string,
  phone: string,
  message: InboundMessage
): Promise<void> {
  const userText = message.text!;

  const userRecord = await prisma.user.findUnique({ where: { id: userId } });
  const analysis = await analyzeMessage(userText, userRecord?.emotionOptIn ?? true);

  await logMessage({
    userId,
    direction: MessageDirection.INBOUND,
    type: MessageType.TEXT,
    content: userText,
    whatsappId: message.whatsappMessageId,
    language: analysis.language,
    emotion: analysis.emotion,
  });

  logger.info({ from: phone, text: userText.slice(0, 80) }, "Processing text message");

  if (isCreatorQuestion(userText)) {
    await sendAndLogReply(userId, phone, userText, CREATOR_REPLY, {
      language: "en",
      emotion: "neutral",
      intent: "creator_info",
    });
    return;
  }

  const memoryResult = await extractAndProcessMemories(userId, userText);

  if (memoryResult.recallResponse) {
    await sendAndLogReply(userId, phone, userText, memoryResult.recallResponse, {
      intent: "memory_recall",
    });
    return;
  }

  const saveConfirmation = buildSaveConfirmation(memoryResult.memories);
  if (saveConfirmation && !needsAiResponse(userText, memoryResult.memories)) {
    await sendAndLogReply(userId, phone, userText, saveConfirmation, {
      intent: "memory_save",
    });
    return;
  }

  const context = await buildConversationContext(userId, userText, analysis);

  const { content, tokensUsed } = await generateChatResponse(context);

  const finalReply = saveConfirmation
    ? `${saveConfirmation}\n\n${content}`
    : content;

  await sendAndLogReply(userId, phone, userText, finalReply, {
    language: context.detectedLanguage,
    emotion: context.emotion,
    intent: "chat",
    tokensUsed,
  });

  inferMemoriesFromExchange(userId, userText, finalReply).catch((err) =>
    logger.warn({ err }, "Background memory inference failed")
  );
}

async function sendAndLogReply(
  userId: string,
  phone: string,
  userMessage: string,
  reply: string,
  meta: {
    language?: string;
    emotion?: string;
    intent?: string;
    tokensUsed?: number;
  }
): Promise<void> {
  await sendTextMessage(phone, reply);

  await appendExchange(userId, userMessage, reply, {
    language: meta.language,
    emotion: meta.emotion,
  });

  await logMessage({
    userId,
    direction: MessageDirection.OUTBOUND,
    type: MessageType.TEXT,
    content: reply,
    tokensUsed: meta.tokensUsed,
    language: meta.language,
    emotion: meta.emotion,
    intent: meta.intent,
  });

  logger.info(
    { to: phone, intent: meta.intent, tokensUsed: meta.tokensUsed },
    "Reply sent"
  );
}

function buildSaveConfirmation(
  memories: { key: string; value: string }[]
): string | null {
  const nameMem = memories.find((m) => m.key === "name");
  if (nameMem) {
    return `Thik hai! Main yaad rakhungi ki aapka naam ${nameMem.value} hai. 😊`;
  }

  const cityMem = memories.find((m) => m.key === "city");
  if (cityMem) {
    return `Noted! ${cityMem.value} — main yaad rakh lungi.`;
  }

  const bizMem = memories.find((m) => m.key.startsWith("business"));
  if (bizMem) {
    return `Business detail save ho gayi. Main yaad rakhungi!`;
  }

  return null;
}

function needsAiResponse(
  text: string,
  memories: { key: string; value: string }[]
): boolean {
  if (memories.length === 0) return true;
  return text.split(/\s+/).length > 5 || text.includes("?");
}
