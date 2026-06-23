export type MessageDirection = "inbound" | "outbound";

export type MessageType =
  | "text"
  | "image"
  | "document"
  | "audio"
  | "video"
  | "sticker"
  | "location"
  | "unknown";

export interface InboundMessage {
  whatsappMessageId: string;
  from: string;
  timestamp: string;
  type: MessageType;
  text?: string;
  mediaId?: string;
  mimeType?: string;
  caption?: string;
}

export interface OutboundMessage {
  to: string;
  type: "text";
  text: string;
}

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

export interface PlanLimits {
  messagesPerDay: number;
  imagesPerDay: number;
  pdfsPerDay: number;
}

export interface UserMemoryEntry {
  key: string;
  value: string;
  category: string;
  source: string;
  confidence: number;
  updatedAt?: Date;
}

export interface UserProfileContext {
  id: string;
  phone: string;
  name: string | null;
  city: string | null;
  language: string;
  timezone: string;
  tone: string;
  businessMode: boolean;
  memories: UserMemoryEntry[];
  interests: string[];
  business: {
    name: string | null;
    type: string | null;
    details: string | null;
    gstin: string | null;
  };
}

export interface ConversationContext {
  userId: string;
  userMessage: string;
  profile: UserProfileContext;
  history: ChatTurn[];
  detectedLanguage: string;
  emotion: string;
  emotionConfidence: number;
  systemPrompt: string;
}

export const QUEUE_NAMES = {
  MESSAGES: "saaya:messages",
  MEDIA: "saaya:media",
  GREETINGS: "saaya:greetings",
  MEMORY: "saaya:memory",
} as const;

export const REDIS_KEYS = {
  session: (userId: string) => `session:${userId}`,
  dedupe: (messageId: string) => `dedupe:msg:${messageId}`,
  rateLimit: (userId: string, feature: string) =>
    `ratelimit:${userId}:${feature}`,
} as const;

export const SESSION_TTL_SECONDS = 86400;
export const SESSION_MAX_TURNS = 20;
export const DEDUPE_TTL_SECONDS = 3600;
