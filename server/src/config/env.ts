import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1),
  SESSION_SECRET: z.string().min(32),
  CORS_ORIGIN: z.string().default("http://localhost:3020"),
  API_ORIGIN: z.string().default("http://localhost:4000"),
  CREDENTIALS_KEY: z.string().min(32),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `  ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
  throw new Error(`Invalid environment:\n${issues}`);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === "production";
export const corsOrigins = env.CORS_ORIGIN.split(",")
  .map((value) => value.trim())
  // A host that never substituted its own reference would otherwise become a
  // literal allowed origin, and every request would fail CORS with no clue why.
  .filter((value) => value.length > 0 && !value.includes("${"));

/**
 * In production the app and the API are different origins, so the session
 * cookie has to be sent cross-site — which browsers only allow for
 * SameSite=None over HTTPS. Locally that would break plain-http development.
 */
export const cookiePolicy = {
  sameSite: isProd ? ("none" as const) : ("lax" as const),
  secure: isProd,
};
