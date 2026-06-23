import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { ConversationContext, SupportedLanguage } from "@saaya/shared";
import {
  EMOTION_TONE_HINTS,
  LANGUAGE_REPLY_INSTRUCTION,
  EMOTIONS,
} from "@saaya/shared";
import { formatMemoriesForPrompt } from "../memory/memory.service.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const personalityBase = readFileSync(
  join(__dirname, "../../prompts/personality.txt"),
  "utf-8"
).trim();

export function buildSystemPrompt(context: ConversationContext): string {
  const { profile, detectedLanguage, emotion } = context;
  const lang = detectedLanguage as SupportedLanguage;
  const langInstruction =
    LANGUAGE_REPLY_INSTRUCTION[lang] ??
    LANGUAGE_REPLY_INSTRUCTION.hi;

  const emotionHint =
    EMOTION_TONE_HINTS[emotion as keyof typeof EMOTION_TONE_HINTS] ??
    EMOTION_TONE_HINTS[EMOTIONS.NEUTRAL];

  const memoryBlock = formatMemoriesForPrompt(profile.memories);

  const profileLines: string[] = [];
  if (profile.name) profileLines.push(`Name: ${profile.name}`);
  if (profile.city) profileLines.push(`City: ${profile.city}`);
  if (profile.interests.length > 0) {
    profileLines.push(`Interests: ${profile.interests.join(", ")}`);
  }
  if (profile.business.name) {
    profileLines.push(`Business: ${profile.business.name}`);
  }
  if (profile.business.type) {
    profileLines.push(`Business type: ${profile.business.type}`);
  }
  if (profile.business.details) {
    profileLines.push(`Business details: ${profile.business.details}`);
  }

  const profileBlock =
    profileLines.length > 0
      ? profileLines.join("\n")
      : "New user — no profile details yet.";

  return `${personalityBase}

─── USER PROFILE ───
${profileBlock}

─── LONG-TERM MEMORY ───
${memoryBlock}

─── LANGUAGE ───
${langInstruction}

─── EMOTION ADAPTATION ───
${emotionHint}

─── PERSONALIZATION RULES ───
- User ka naam use karo jab natural ho (har message me nahi).
- Pichli baaton ka context yaad rakho aur uske hisaab se reply do.
- Warm, human, friendly tone — robot jaisa mat lago.
- Short aur useful jawab do.
- Creator/owner ke baare me sirf tab batao jab user specifically puche.`;
}

export function buildContextSummary(context: ConversationContext): string {
  const turnCount = context.history.length;
  const name = context.profile.name ?? "User";
  return `${name} | lang:${context.detectedLanguage} | emotion:${context.emotion} | turns:${turnCount}`;
}
