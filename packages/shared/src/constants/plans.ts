export const INTENTS = {
  CHAT: "chat",
  IMAGE: "image",
  PDF: "pdf",
  DOCUMENT: "document",
  NEWS: "news",
  WEATHER: "weather",
  MARKETS: "markets",
  BUSINESS: "business",
  GREETING: "greeting",
  MEMORY: "memory",
} as const;

export type Intent = (typeof INTENTS)[keyof typeof INTENTS];

export const PLAN_SLUGS = {
  FREE: "free",
  BASIC: "basic",
  PRO: "pro",
  BUSINESS: "business",
} as const;

export const DEFAULT_PLAN_LIMITS = {
  messagesPerDay: 20,
  imagesPerDay: 0,
  pdfsPerDay: 0,
} as const;
