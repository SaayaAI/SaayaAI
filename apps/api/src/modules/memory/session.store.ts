import type { ChatTurn } from "@saaya/shared";
import {
  REDIS_KEYS,
  SESSION_MAX_TURNS,
  SESSION_TTL_SECONDS,
} from "@saaya/shared";
import { MessageDirection, prisma } from "@saaya/database";
import { getRedis } from "../../config/redis.js";
import { logger } from "../../utils/logger.js";

interface SessionPayload {
  turns: ChatTurn[];
  lastLanguage: string;
  lastEmotion: string;
}

function emptySession(): SessionPayload {
  return { turns: [], lastLanguage: "hi", lastEmotion: "neutral" };
}

export async function getSession(userId: string): Promise<SessionPayload> {
  const redis = getRedis();
  const raw = await redis.get(REDIS_KEYS.session(userId));

  if (raw) {
    try {
      return JSON.parse(raw) as SessionPayload;
    } catch {
      logger.warn({ userId }, "Corrupt session data — resetting");
    }
  }

  const dbTurns = await loadHistoryFromDatabase(userId, SESSION_MAX_TURNS);
  const session: SessionPayload = {
    turns: dbTurns,
    lastLanguage: "hi",
    lastEmotion: "neutral",
  };

  if (dbTurns.length > 0) {
    await saveSession(userId, session);
  }

  return session;
}

export async function getRecentTurns(
  userId: string,
  limit = SESSION_MAX_TURNS
): Promise<ChatTurn[]> {
  const session = await getSession(userId);
  return session.turns.slice(-limit);
}

export async function appendTurn(
  userId: string,
  turn: ChatTurn,
  meta?: { language?: string; emotion?: string }
): Promise<void> {
  const session = await getSession(userId);
  session.turns.push(turn);

  if (session.turns.length > SESSION_MAX_TURNS) {
    session.turns = session.turns.slice(-SESSION_MAX_TURNS);
  }

  if (meta?.language) session.lastLanguage = meta.language;
  if (meta?.emotion) session.lastEmotion = meta.emotion;

  await saveSession(userId, session);
}

export async function appendExchange(
  userId: string,
  userMessage: string,
  assistantReply: string,
  meta?: { language?: string; emotion?: string }
): Promise<void> {
  await appendTurn(userId, { role: "user", content: userMessage }, meta);
  await appendTurn(userId, { role: "assistant", content: assistantReply }, meta);
}

export async function clearSession(userId: string): Promise<void> {
  const redis = getRedis();
  await redis.del(REDIS_KEYS.session(userId));
}

async function saveSession(
  userId: string,
  session: SessionPayload
): Promise<void> {
  const redis = getRedis();
  await redis.set(
    REDIS_KEYS.session(userId),
    JSON.stringify(session),
    "EX",
    SESSION_TTL_SECONDS
  );
}

async function loadHistoryFromDatabase(
  userId: string,
  limit: number
): Promise<ChatTurn[]> {
  const logs = await prisma.messageLog.findMany({
    where: {
      userId,
      type: "TEXT",
      content: { not: null },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      direction: true,
      content: true,
      createdAt: true,
    },
  });

  return logs
    .reverse()
    .filter((log) => log.content)
    .map((log) => ({
      role:
        log.direction === MessageDirection.INBOUND
          ? ("user" as const)
          : ("assistant" as const),
      content: log.content!,
      timestamp: log.createdAt.toISOString(),
    }));
}
