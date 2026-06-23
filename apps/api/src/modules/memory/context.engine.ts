import type { ConversationContext } from "@saaya/shared";
import { getRecentTurns } from "../memory/session.store.js";
import { getUserProfile, updateUserActivity, updatePreferredLanguage } from "../users/user-profile.service.js";
import { analyzeMessage, type MessageAnalysis } from "../router/message.analyzer.js";
import { buildSystemPrompt } from "../ai/prompt.builder.js";
import { prisma } from "../../config/database.js";
import { logger } from "../../utils/logger.js";

export async function buildConversationContext(
  userId: string,
  userMessage: string,
  precomputed?: MessageAnalysis
): Promise<ConversationContext> {
  const [profile, history, user] = await Promise.all([
    getUserProfile(userId),
    getRecentTurns(userId),
    prisma.user.findUnique({ where: { id: userId } }),
  ]);

  if (!profile || !user) {
    throw new Error(`User not found: ${userId}`);
  }

  const analysis =
    precomputed ??
    (await analyzeMessage(userMessage, user.emotionOptIn));

  if (analysis.language !== profile.language) {
    await updatePreferredLanguage(userId, analysis.language).catch((err) =>
      logger.warn({ err }, "Failed to update preferred language")
    );
    profile.language = analysis.language;
  }

  await updateUserActivity(userId, analysis.emotion);

  const baseContext: ConversationContext = {
    userId,
    userMessage,
    profile,
    history,
    detectedLanguage: analysis.language,
    emotion: analysis.emotion,
    emotionConfidence: analysis.confidence,
    systemPrompt: "",
  };

  baseContext.systemPrompt = buildSystemPrompt(baseContext);

  logger.debug(
    {
      userId,
      language: analysis.language,
      emotion: analysis.emotion,
      historyTurns: history.length,
    },
    "Conversation context built"
  );

  return baseContext;
}
