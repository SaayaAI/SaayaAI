import {
  MessageDirection,
  MessageType,
  SubscriptionStatus,
  UserStatus,
  prisma,
} from "@saaya/database";
import type { User } from "@saaya/database";
import { normalizePhone } from "../../utils/phone.normalizer.js";
import { logger } from "../../utils/logger.js";

export async function findOrCreateUser(phone: string): Promise<User> {
  const normalized = normalizePhone(phone);

  let user = await prisma.user.findUnique({
    where: { phone: normalized },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        phone: normalized,
        status: UserStatus.ACTIVE,
        preferences: { create: {} },
      },
    });

    const freePlan = await prisma.plan.findUnique({
      where: { slug: "free" },
    });

    if (freePlan) {
      await prisma.subscription.create({
        data: {
          userId: user.id,
          planId: freePlan.id,
          status: SubscriptionStatus.ACTIVE,
        },
      });
    }

    logger.info({ userId: user.id, phone: normalized }, "New user registered");
  }

  return user;
}

export async function logMessage(params: {
  userId: string;
  direction: MessageDirection;
  type: MessageType;
  content?: string;
  whatsappId?: string;
  tokensUsed?: number;
  language?: string;
  emotion?: string;
  intent?: string;
}): Promise<void> {
  await prisma.messageLog.create({
    data: {
      userId: params.userId,
      direction: params.direction,
      type: params.type,
      content: params.content?.slice(0, 4000),
      whatsappId: params.whatsappId,
      tokensUsed: params.tokensUsed,
      language: params.language,
      emotion: params.emotion,
      intent: params.intent,
    },
  });
}
