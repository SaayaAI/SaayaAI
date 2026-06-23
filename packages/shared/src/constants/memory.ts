export const MEMORY_CATEGORIES = {
  PROFILE: "profile",
  INTEREST: "interest",
  BUSINESS: "business",
  FACT: "fact",
  PREFERENCE: "preference",
} as const;

export type MemoryCategory =
  (typeof MEMORY_CATEGORIES)[keyof typeof MEMORY_CATEGORIES];

export const MEMORY_KEYS = {
  NAME: "name",
  CITY: "city",
  LANGUAGE: "language",
  INTERESTS: "interests",
  BUSINESS_NAME: "business_name",
  BUSINESS_TYPE: "business_type",
  BUSINESS_DETAILS: "business_details",
  GSTIN: "gstin",
  OCCUPATION: "occupation",
  AGE: "age",
  CONVERSATION_SUMMARY: "conversation_summary",
} as const;

export type MemoryKey = (typeof MEMORY_KEYS)[keyof typeof MEMORY_KEYS];

export const MEMORY_KEY_LABELS: Record<MemoryKey, string> = {
  name: "Name",
  city: "City",
  language: "Preferred Language",
  interests: "Interests",
  business_name: "Business Name",
  business_type: "Business Type",
  business_details: "Business Details",
  gstin: "GSTIN",
  occupation: "Occupation",
  age: "Age",
  conversation_summary: "Conversation Summary",
};

export const EMOTIONS = {
  JOY: "joy",
  SADNESS: "sadness",
  ANGER: "anger",
  ANXIETY: "anxiety",
  EXCITEMENT: "excitement",
  GRATITUDE: "gratitude",
  FRUSTRATION: "frustration",
  NEUTRAL: "neutral",
} as const;

export type Emotion = (typeof EMOTIONS)[keyof typeof EMOTIONS];

export const EMOTION_TONE_HINTS: Record<Emotion, string> = {
  joy: "User khush lag raha hai — warm aur enthusiastic tone rakho.",
  sadness: "User udaas lag raha hai — gentle, empathetic aur supportive tone rakho.",
  anger: "User gussa hai — calm, respectful aur solution-focused tone rakho.",
  anxiety: "User chinta me hai — reassuring aur patient tone rakho.",
  excitement: "User excited hai — energetic aur encouraging tone rakho.",
  gratitude: "User thankful hai — warm aur humble tone rakho.",
  frustration: "User frustrated hai — helpful, clear aur problem-solving tone rakho.",
  neutral: "Natural friendly tone rakho.",
};

export const CREATOR_REPLY =
  "Saaya AI was created by DGX. Founder: Dhiraj Kumar Malviya. Support and development assistance: Sonu Malviya.";
