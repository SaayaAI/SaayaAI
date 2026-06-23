-- Phase 1: Memory & Personality System

CREATE TYPE "MemorySource" AS ENUM ('EXPLICIT', 'INFERRED', 'ADMIN');
CREATE TYPE "MemoryCategory" AS ENUM ('PROFILE', 'INTEREST', 'BUSINESS', 'FACT', 'PREFERENCE');

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "city" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_emotion" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_active_at" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "users_last_active_at_idx" ON "users"("last_active_at");

ALTER TABLE "user_memories" ADD COLUMN IF NOT EXISTS "category" "MemoryCategory" NOT NULL DEFAULT 'PROFILE';
ALTER TABLE "user_memories" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Migrate source column from text to enum
ALTER TABLE "user_memories" ALTER COLUMN "source" DROP DEFAULT;
ALTER TABLE "user_memories"
  ALTER COLUMN "source" TYPE "MemorySource"
  USING (
    CASE
      WHEN "source" = 'explicit' THEN 'EXPLICIT'::"MemorySource"
      WHEN "source" = 'inferred' THEN 'INFERRED'::"MemorySource"
      WHEN "source" = 'admin' THEN 'ADMIN'::"MemorySource"
      ELSE 'EXPLICIT'::"MemorySource"
    END
  );
ALTER TABLE "user_memories" ALTER COLUMN "source" SET DEFAULT 'EXPLICIT';

CREATE INDEX IF NOT EXISTS "user_memories_user_id_category_idx" ON "user_memories"("user_id", "category");
