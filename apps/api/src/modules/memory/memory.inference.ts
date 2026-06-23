import OpenAI from "openai";
import {
  MEMORY_CATEGORIES,
  MEMORY_KEYS,
} from "@saaya/shared";
import { env } from "../../config/env.js";
import { logger } from "../../utils/logger.js";
import { saveMemory } from "./memory.service.js";

let openaiClient: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  }
  return openaiClient;
}

interface InferredFact {
  key: string;
  value: string;
  category: string;
}

const ALLOWED_KEYS = new Set([
  MEMORY_KEYS.NAME,
  MEMORY_KEYS.CITY,
  MEMORY_KEYS.INTERESTS,
  MEMORY_KEYS.OCCUPATION,
  MEMORY_KEYS.BUSINESS_NAME,
  MEMORY_KEYS.BUSINESS_TYPE,
  MEMORY_KEYS.BUSINESS_DETAILS,
  MEMORY_KEYS.AGE,
]);

export async function inferMemoriesFromExchange(
  userId: string,
  userMessage: string,
  assistantReply: string
): Promise<void> {
  try {
    const client = getOpenAI();
    const completion = await client.chat.completions.create({
      model: env.OPENAI_ANALYSIS_MODEL,
      messages: [
        {
          role: "system",
          content: `Extract NEW factual information the user explicitly shared about themselves.
Return JSON: {"facts":[{"key":"name|city|interests|occupation|business_name|business_type|business_details|age","value":"...","category":"profile|interest|business"}]}
Rules:
- Only extract clear facts the USER stated, not assumptions
- Return empty facts array if nothing new
- Do not extract from assistant messages
- interests value should be comma-separated if multiple`,
        },
        {
          role: "user",
          content: `User: ${userMessage}\nAssistant: ${assistantReply}`,
        },
      ],
      temperature: 0,
      max_tokens: 200,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) return;

    const parsed = JSON.parse(raw) as { facts?: InferredFact[] };
    const facts = parsed.facts ?? [];

    for (const fact of facts) {
      if (!ALLOWED_KEYS.has(fact.key) || !fact.value?.trim()) continue;

      await saveMemory({
        userId,
        key: fact.key,
        value: fact.value.trim(),
        category: fact.category ?? MEMORY_CATEGORIES.PROFILE,
        source: "inferred",
        confidence: 0.8,
      });
    }

    if (facts.length > 0) {
      logger.info(
        { userId, count: facts.length },
        "Inferred memories saved"
      );
    }
  } catch (error) {
    logger.warn({ error, userId }, "Memory inference failed");
  }
}
