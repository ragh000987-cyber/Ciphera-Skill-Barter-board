```typescript
import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce.number().int().min(1).max(65535).default(4000),

  WEB_URL: z.string().url().default("http://localhost:5173"),

  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  SESSION_SECRET: z
    .string()
    .min(32, "SESSION_SECRET must contain at least 32 characters"),

  SESSION_COOKIE_NAME: z.string().default("skillbarter.sid"),

  SESSION_MAX_AGE_DAYS: z.coerce.number().int().min(1).max(30).default(7),

  SMTP_HOST: z.string().optional().default(""),
  SMTP_PORT: z.coerce.number().int().min(1).max(65535).default(587),
  SMTP_USER: z.string().optional().default(""),
  SMTP_PASSWORD: z.string().optional().default(""),
  EMAIL_FROM: z.string().optional().default(""),

  STORAGE_PROVIDER: z.enum(["local", "s3"]).default("local"),
  UPLOAD_DIR: z.string().default("uploads"),

  REDIS_URL: z.string().optional().default(""),

  S3_ENDPOINT: z.string().optional().default(""),
  S3_REGION: z.string().optional().default(""),
  S3_BUCKET: z.string().optional().default(""),
  S3_ACCESS_KEY_ID: z.string().optional().default(""),
  S3_SECRET_ACCESS_KEY: z.string().optional().default("")
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error("Invalid environment configuration:");

  console.error(
    z.prettifyError(result.error)
  );

  process.exit(1);
}

if (
  result.data.NODE_ENV === "production" &&
  result.data.SESSION_SECRET === "replace_with_a_long_random_secret"
) {
  throw new Error("Configure a secure SESSION_SECRET before production.");
}

export const env = result.data;
```
