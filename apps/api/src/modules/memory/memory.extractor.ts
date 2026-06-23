import {
  MEMORY_CATEGORIES,
  MEMORY_KEYS,
} from "@saaya/shared";
import { saveMemory, getMemory } from "./memory.service.js";
import { logger } from "../../utils/logger.js";

export interface ExtractedMemory {
  key: string;
  value: string;
  category: string;
}

export interface MemoryExtractionResult {
  memories: ExtractedMemory[];
  recallResponse: string | null;
}

const CREATOR_PATTERNS = [
  /who (created|made|built|developed) you/i,
  /who is your (creator|founder|owner|developer)/i,
  /who are you (made|created|built) by/i,
  /tumhe kisne banaya/i,
  /tumhara (founder|owner|creator) kaun/i,
  /kisne (banaya|develop kiya|banaaya)/i,
  /saaya (ko|ai ko) kisne banaya/i,
];

const NAME_SET_PATTERNS = [
  /(?:mera|my)\s+naam\s+(?:hai\s+)?(.+)/i,
  /(?:i am|i'm|im)\s+([a-zA-Z\u0900-\u097F\u0A80-\u0AFF\u0980-\u09FF\u0600-\u06FF]{2,30})/i,
  /(?:call me|mujhe)\s+(.+?)(?:\s+bulao|\s+bolo|$)/i,
  /naam\s+(.+?)\s+hai/i,
];

const NAME_RECALL_PATTERNS = [
  /mera naam kya hai/i,
  /what(?:'s| is) my name/i,
  /do you (know|remember) my name/i,
  /tumhe mera naam yaad hai/i,
  /naam yaad hai/i,
];

const CITY_PATTERNS = [
  /(?:main|i am|i'm|mein)\s+(.+?)\s+(?:se hoon|se hu|se hun|mein rehta|mein rehti|city|sheher)/i,
  /(?:mera sheher|my city|i live in|main rehta hoon)\s+(.+)/i,
  /(?:from)\s+([a-zA-Z\u0900-\u097F]{2,30})/i,
];

const INTEREST_PATTERNS = [
  /(?:mujhe|i like|i love|interested in|pasand hai)\s+(.+)/i,
  /(?:my hobby|mera shauk|hobby)\s+(?:is|hai)\s+(.+)/i,
];

const BUSINESS_PATTERNS = [
  {
    key: MEMORY_KEYS.BUSINESS_NAME,
    patterns: [
      /(?:mera business|my business|dukan|shop|company)(?:\s+ka naam|\s+name)?\s+(?:is|hai)\s+(.+)/i,
      /(?:business name)\s+(?:is|:)\s*(.+)/i,
    ],
    category: MEMORY_CATEGORIES.BUSINESS,
  },
  {
    key: MEMORY_KEYS.BUSINESS_TYPE,
    patterns: [
      /(?:main|i am|i run)\s+(?:a|an|ek)\s+(.+?)(?:\s+business|\s+ka kaam|$)/i,
      /(?:business type|kaam)\s+(?:is|hai)\s+(.+)/i,
    ],
    category: MEMORY_CATEGORIES.BUSINESS,
  },
  {
    key: MEMORY_KEYS.GSTIN,
    patterns: [/(?:gstin|gst)\s+(?:is|hai|number)\s*[:.]?\s*([0-9A-Z]{15})/i],
    category: MEMORY_CATEGORIES.BUSINESS,
  },
];

const REMEMBER_PATTERN =
  /(?:remember|yaad rakh|note kar|save kar)(?:\s+that|\s+ki|\s+lo)?[:\s]+(.+)/i;

export function isCreatorQuestion(text: string): boolean {
  return CREATOR_PATTERNS.some((p) => p.test(text));
}

export async function extractAndProcessMemories(
  userId: string,
  text: string
): Promise<MemoryExtractionResult> {
  const trimmed = text.trim();
  const result: MemoryExtractionResult = {
    memories: [],
    recallResponse: null,
  };

  if (NAME_RECALL_PATTERNS.some((p) => p.test(trimmed))) {
    const name =
      (await getMemory(userId, MEMORY_KEYS.NAME)) ??
      null;
    result.recallResponse = name
      ? `Aapka naam ${name} hai. Main yaad rakhti hoon! 😊`
      : "Aapne abhi tak mujhe apna naam nahi bataya. Apna naam bata do, main yaad rakh lungi!";
    return result;
  }

  for (const pattern of NAME_SET_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match?.[1]) {
      const name = cleanValue(match[1]);
      if (name.length >= 2 && name.length <= 40 && !isQuestion(name)) {
        result.memories.push({
          key: MEMORY_KEYS.NAME,
          value: capitalize(name),
          category: MEMORY_CATEGORIES.PROFILE,
        });
        break;
      }
    }
  }

  for (const pattern of CITY_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match?.[1]) {
      const city = cleanValue(match[1]);
      if (city.length >= 2 && city.length <= 50) {
        result.memories.push({
          key: MEMORY_KEYS.CITY,
          value: capitalize(city),
          category: MEMORY_CATEGORIES.PROFILE,
        });
        break;
      }
    }
  }

  for (const pattern of INTEREST_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match?.[1]) {
      const interest = cleanValue(match[1]);
      if (interest.length >= 2) {
        result.memories.push({
          key: MEMORY_KEYS.INTERESTS,
          value: interest,
          category: MEMORY_CATEGORIES.INTEREST,
        });
      }
    }
  }

  for (const biz of BUSINESS_PATTERNS) {
    for (const pattern of biz.patterns) {
      const match = trimmed.match(pattern);
      if (match?.[1]) {
        const value = cleanValue(match[1]);
        if (value.length >= 2) {
          result.memories.push({
            key: biz.key,
            value,
            category: biz.category,
          });
        }
        break;
      }
    }
  }

  const rememberMatch = trimmed.match(REMEMBER_PATTERN);
  if (rememberMatch?.[1]) {
    result.memories.push({
      key: `fact_${Date.now()}`,
      value: cleanValue(rememberMatch[1]),
      category: MEMORY_CATEGORIES.FACT,
    });
  }

  for (const mem of result.memories) {
    await saveMemory({
      userId,
      key: mem.key,
      value: mem.value,
      category: mem.category,
      source: "explicit",
    });
  }

  if (result.memories.length > 0) {
    logger.info(
      { userId, keys: result.memories.map((m) => m.key) },
      "Explicit memories extracted"
    );
  }

  return result;
}

function cleanValue(raw: string): string {
  return raw
    .replace(/[.!?,]+$/, "")
    .replace(/\s+(hai|hu|hun|hoon|ha|he|ho)$/i, "")
    .trim();
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function isQuestion(s: string): boolean {
  return /^(kya|what|who|how|kyun|kaun)/i.test(s);
}
