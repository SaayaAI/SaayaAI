import { config } from "dotenv";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../../../../.env") });

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().default(3000),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace"])
    .default("info"),
  API_BASE_URL: z.string().url().default("http://localhost:3000"),

  WHATSAPP_TOKEN: z.string().min(1, "WHATSAPP_TOKEN is required"),
  PHONE_NUMBER_ID: z.string().min(1, "PHONE_NUMBER_ID is required"),
  VERIFY_TOKEN: z.string().min(1, "VERIFY_TOKEN is required"),
  WEBHOOK_SECRET: z.string().optional(),

  OPENAI_API_KEY: z.string().min(1, "OPENAI_API_KEY is required"),
  OPENAI_MODEL: z.string().default("gpt-4o-mini"),
  OPENAI_ANALYSIS_MODEL: z.string().default("gpt-4o-mini"),
  OPENAI_MAX_TOKENS: z.coerce.number().default(500),

  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  REDIS_URL: z.string().min(1, "REDIS_URL is required"),

  JWT_SECRET: z.string().optional(),
  JWT_EXPIRES_IN: z.string().default("7d"),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const formatted = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Environment validation failed:\n${formatted}`);
  }

  return result.data;
}

export const env = loadEnv();
