import OpenAI from "openai";
import type { ConversationContext } from "@saaya/shared";
import { env } from "../../config/env.js";
import { logger } from "../../utils/logger.js";

let openaiClient: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  }
  return openaiClient;
}

export interface ChatResponse {
  content: string;
  tokensUsed: number;
}

export async function generateChatResponse(
  context: ConversationContext
): Promise<ChatResponse> {
  const client = getOpenAI();

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: context.systemPrompt },
    ...context.history.map((turn) => ({
      role: turn.role as "user" | "assistant",
      content: turn.content,
    })),
    { role: "user", content: context.userMessage },
  ];

  try {
    const completion = await client.chat.completions.create({
      model: env.OPENAI_MODEL,
      messages,
      temperature: 0.75,
      max_tokens: env.OPENAI_MAX_TOKENS,
      presence_penalty: 0.3,
      frequency_penalty: 0.2,
    });

    const content =
      completion.choices[0]?.message?.content ??
      fallbackReply(context.detectedLanguage);

    return {
      content,
      tokensUsed: completion.usage?.total_tokens ?? 0,
    };
  } catch (error) {
    logger.error({ error }, "OpenAI chat completion failed");
    return {
      content: fallbackReply(context.detectedLanguage),
      tokensUsed: 0,
    };
  }
}

function fallbackReply(language: string): string {
  const replies: Record<string, string> = {
    en: "Sorry, I'm a bit busy right now. Please try again in a moment.",
    hi: "Sorry, abhi thoda busy hoon. Thodi der baad try karo.",
    gu: "માફ કરશો, હમણાં થોડું વ્યસ્ત છું. થોડી વાર પછી ફરી પ્રયાસ કરો.",
    mr: "माफ करा, आत्ता थोडं व्यस्त आहे. थोड्या वेळाने पुन्हा प्रयत्न करा.",
    ur: "معذرت، ابھی تھوڑا مصروف ہوں۔ تھوڑی دیر بعد دوبارہ کوشش کریں۔",
    hinglish: "Sorry yaar, abhi thoda busy hoon. Thodi der baad try karo.",
  };
  return replies[language] ?? replies.hi!;
}

export async function checkOpenAIHealth(): Promise<boolean> {
  try {
    const client = getOpenAI();
    await client.models.list();
    return true;
  } catch {
    return false;
  }
}
