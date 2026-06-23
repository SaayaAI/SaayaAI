import {
  MemoryCategory,
  MemorySource,
  prisma,
} from "@saaya/database";
import type { UserMemoryEntry } from "@saaya/shared";
import {
  MEMORY_CATEGORIES,
  MEMORY_KEYS,
} from "@saaya/shared";
import { logger } from "../../utils/logger.js";

const CATEGORY_MAP: Record<string, MemoryCategory> = {
  [MEMORY_CATEGORIES.PROFILE]: MemoryCategory.PROFILE,
  [MEMORY_CATEGORIES.INTEREST]: MemoryCategory.INTEREST,
  [MEMORY_CATEGORIES.BUSINESS]: MemoryCategory.BUSINESS,
  [MEMORY_CATEGORIES.FACT]: MemoryCategory.FACT,
  [MEMORY_CATEGORIES.PREFERENCE]: MemoryCategory.PREFERENCE,
};

const SOURCE_MAP: Record<string, MemorySource> = {
  explicit: MemorySource.EXPLICIT,
  inferred: MemorySource.INFERRED,
  admin: MemorySource.ADMIN,
};

export interface SaveMemoryInput {
  userId: string;
  key: string;
  value: string;
  category?: string;
  source?: "explicit" | "inferred" | "admin";
  confidence?: number;
}

export async function saveMemory(input: SaveMemoryInput): Promise<void> {
  const trimmed = input.value.trim();
  if (!trimmed || trimmed.length < 1) return;

  const category =
    CATEGORY_MAP[input.category ?? MEMORY_CATEGORIES.PROFILE] ??
    MemoryCategory.PROFILE;

  const source =
    SOURCE_MAP[input.source ?? "explicit"] ?? MemorySource.EXPLICIT;

  await prisma.userMemory.upsert({
    where: {
      userId_key: { userId: input.userId, key: input.key },
    },
    update: {
      value: trimmed,
      category,
      source,
      confidence: input.confidence ?? 1.0,
    },
    create: {
      userId: input.userId,
      key: input.key,
      value: trimmed,
      category,
      source,
      confidence: input.confidence ?? 1.0,
    },
  });

  if (input.key === MEMORY_KEYS.NAME) {
    await prisma.user.update({
      where: { id: input.userId },
      data: { name: trimmed },
    });
  }

  if (input.key === MEMORY_KEYS.CITY) {
    await prisma.user.update({
      where: { id: input.userId },
      data: { city: trimmed },
    });
  }

  if (input.key === MEMORY_KEYS.LANGUAGE) {
    await prisma.user.update({
      where: { id: input.userId },
      data: { language: trimmed },
    });
  }

  logger.debug(
    { userId: input.userId, key: input.key, source: input.source },
    "Memory saved"
  );
}

export async function getMemories(userId: string): Promise<UserMemoryEntry[]> {
  const rows = await prisma.userMemory.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });

  return rows.map((row) => ({
    key: row.key,
    value: row.value,
    category: row.category.toLowerCase(),
    source: row.source.toLowerCase(),
    confidence: row.confidence,
    updatedAt: row.updatedAt,
  }));
}

export async function getMemory(
  userId: string,
  key: string
): Promise<string | null> {
  const row = await prisma.userMemory.findUnique({
    where: { userId_key: { userId, key } },
  });
  return row?.value ?? null;
}

export async function deleteMemory(userId: string, key: string): Promise<void> {
  await prisma.userMemory.deleteMany({ where: { userId, key } });
}

export async function getMemoriesByCategory(
  userId: string,
  category: string
): Promise<UserMemoryEntry[]> {
  const prismaCategory =
    CATEGORY_MAP[category.toLowerCase()] ?? MemoryCategory.PROFILE;

  const rows = await prisma.userMemory.findMany({
    where: { userId, category: prismaCategory },
    orderBy: { updatedAt: "desc" },
  });

  return rows.map((row) => ({
    key: row.key,
    value: row.value,
    category: row.category.toLowerCase(),
    source: row.source.toLowerCase(),
    confidence: row.confidence,
    updatedAt: row.updatedAt,
  }));
}

export function formatMemoriesForPrompt(memories: UserMemoryEntry[]): string {
  if (memories.length === 0) return "No stored memories yet.";

  return memories
    .filter((m) => m.key !== MEMORY_KEYS.CONVERSATION_SUMMARY)
    .map((m) => `- ${m.key}: ${m.value}`)
    .join("\n");
}
