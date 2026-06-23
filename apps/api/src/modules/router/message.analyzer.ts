import OpenAI from "openai";
import type { Emotion, SupportedLanguage } from "@saaya/shared";
import {
  EMOTIONS,
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
} from "@saaya/shared";
import { env } from "../../config/env.js";
import { logger } from "../../utils/logger.js";

export interface MessageAnalysis {
  language: SupportedLanguage;
  emotion: Emotion;
  confidence: number;
}

const EMOTION_KEYWORDS: Record<Emotion, RegExp[]> = {
  joy: [/thank|shukriya|dhanyavad|khush|happy|great|awesome|badhiya|mast|😊|😄|🎉/i],
  sadness: [/sad|udaas|dukhi|depressed|rona|cry|miss|akela|alone|😢|😭/i],
  anger: [/gussa|angry|annoyed|irritated|hate|pagal|bakwas|worst|😡|🤬/i],
  anxiety: [/tension|worried|chinta|anxious|dar|fear|nervous|stress|pareshan/i],
  excitement: [/excited|can't wait|bahut excited|jaldi|wow|amazing|🔥|🚀/i],
  gratitude: [/thank|shukriya|dhanyavad|grateful|appreciate|bahut achha/i],
  frustration: [/frustrated|problem|nahi ho raha|not working|fed up|irritate/i],
  neutral: [],
};

const SCRIPT_HINTS: { script: RegExp; language: SupportedLanguage }[] = [
  { script: /[\u0A80-\u0AFF]/, language: "gu" },
  { script: /[\u0900-\u097F]/, language: "hi" },
  { script: /[\u0600-\u06FF]/, language: "ur" },
];

function detectLanguageHeuristic(text: string): SupportedLanguage {
  for (const { script, language } of SCRIPT_HINTS) {
    if (script.test(text)) return language;
  }

  const latin = (text.match(/[a-zA-Z]/g) ?? []).length;
  const devanagari = (text.match(/[\u0900-\u097F]/g) ?? []).length;

  if (devanagari > 0 && latin > 0) return "hinglish";
  if (devanagari > latin) return "hi";
  if (latin > 0) return "en";

  return DEFAULT_LANGUAGE;
}

function detectEmotionHeuristic(text: string): Emotion {
  for (const [emotion, patterns] of Object.entries(EMOTION_KEYWORDS)) {
    if (emotion === EMOTIONS.NEUTRAL) continue;
    if (patterns.some((p) => p.test(text))) {
      return emotion as Emotion;
    }
  }
  return EMOTIONS.NEUTRAL;
}

let openaiClient: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  }
  return openaiClient;
}

export async function analyzeMessage(
  text: string,
  emotionOptIn = true
): Promise<MessageAnalysis> {
  const heuristicLanguage = detectLanguageHeuristic(text);
  const heuristicEmotion = emotionOptIn
    ? detectEmotionHeuristic(text)
    : EMOTIONS.NEUTRAL;

  const needsAiAnalysis =
    text.length > 15 ||
    heuristicEmotion === EMOTIONS.NEUTRAL ||
    heuristicLanguage === "hinglish";

  if (!needsAiAnalysis) {
    return {
      language: heuristicLanguage,
      emotion: heuristicEmotion,
      confidence: 0.75,
    };
  }

  try {
    const client = getOpenAI();
    const completion = await client.chat.completions.create({
      model: env.OPENAI_ANALYSIS_MODEL,
      messages: [
        {
          role: "system",
          content: `Analyze the user message. Return JSON only:
{"language":"hi|en|gu|mr|ur|hinglish","emotion":"joy|sadness|anger|anxiety|excitement|gratitude|frustration|neutral","confidence":0.0-1.0}
Languages: Hindi(hi), English(en), Gujarati(gu), Marathi(mr), Urdu(ur), Hinglish(hinglish).`,
        },
        { role: "user", content: text },
      ],
      temperature: 0,
      max_tokens: 80,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) throw new Error("Empty analysis response");

    const parsed = JSON.parse(raw) as {
      language?: string;
      emotion?: string;
      confidence?: number;
    };

    const language = SUPPORTED_LANGUAGES.includes(
      parsed.language as SupportedLanguage
    )
      ? (parsed.language as SupportedLanguage)
      : heuristicLanguage;

    const emotion = Object.values(EMOTIONS).includes(parsed.emotion as Emotion)
      ? (parsed.emotion as Emotion)
      : heuristicEmotion;

    return {
      language,
      emotion: emotionOptIn ? emotion : EMOTIONS.NEUTRAL,
      confidence: parsed.confidence ?? 0.85,
    };
  } catch (error) {
    logger.warn({ error }, "AI message analysis failed — using heuristics");
    return {
      language: heuristicLanguage,
      emotion: heuristicEmotion,
      confidence: 0.6,
    };
  }
}

export { detectLanguageHeuristic, detectEmotionHeuristic };
