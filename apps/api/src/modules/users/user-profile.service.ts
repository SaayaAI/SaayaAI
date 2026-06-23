import { prisma } from "@saaya/database";
import type { UserProfileContext } from "@saaya/shared";
import { MEMORY_KEYS } from "@saaya/shared";
import { getMemories } from "./memory.service.js";

export async function getUserProfile(
  userId: string
): Promise<UserProfileContext | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { preferences: true },
  });

  if (!user) return null;

  const memories = await getMemories(userId);

  const memoryMap = new Map(memories.map((m) => [m.key, m.value]));

  const interestsRaw = memoryMap.get(MEMORY_KEYS.INTERESTS);
  const interests = interestsRaw
    ? interestsRaw.split(",").map((s) => s.trim()).filter(Boolean)
    : memories
        .filter((m) => m.category === "interest")
        .map((m) => m.value);

  return {
    id: user.id,
    phone: user.phone,
    name: user.name ?? memoryMap.get(MEMORY_KEYS.NAME) ?? null,
    city: user.city ?? memoryMap.get(MEMORY_KEYS.CITY) ?? null,
    language: user.language,
    timezone: user.timezone,
    tone: user.preferences?.tone ?? "friendly",
    businessMode: user.preferences?.businessMode ?? false,
    memories,
    interests,
    business: {
      name: memoryMap.get(MEMORY_KEYS.BUSINESS_NAME) ?? null,
      type: memoryMap.get(MEMORY_KEYS.BUSINESS_TYPE) ?? null,
      details: memoryMap.get(MEMORY_KEYS.BUSINESS_DETAILS) ?? null,
      gstin: memoryMap.get(MEMORY_KEYS.GSTIN) ?? null,
    },
  };
}

export async function updateUserActivity(
  userId: string,
  emotion?: string
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      lastActiveAt: new Date(),
      ...(emotion ? { lastEmotion: emotion } : {}),
    },
  });
}

export async function updatePreferredLanguage(
  userId: string,
  language: string
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { language },
  });
}
