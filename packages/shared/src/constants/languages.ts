export const SUPPORTED_LANGUAGES = ["hi", "en", "gu", "mr", "ur", "hinglish"] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: SupportedLanguage = "hi";

export const DEFAULT_TIMEZONE = "Asia/Kolkata";

export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  hi: "Hindi",
  en: "English",
  gu: "Gujarati",
  mr: "Marathi",
  ur: "Urdu",
  hinglish: "Hinglish",
};

export const LANGUAGE_REPLY_INSTRUCTION: Record<SupportedLanguage, string> = {
  hi: "User Hindi me baat kar raha hai — pure Hindi me jawab do.",
  en: "User is speaking English — reply in English.",
  gu: "User Gujarati me baat kare che — Gujarati ma jawab aapo.",
  mr: "User Marathi madhe bolat aahe — Marathi madhe uttar dya.",
  ur: "User Urdu me baat kar raha hai — Urdu me jawab do.",
  hinglish: "User Hinglish me baat kar raha hai — natural Hinglish me jawab do.",
};
