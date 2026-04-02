import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  NEXTAUTH_SECRET: z.string().min(1, "NEXTAUTH_SECRET is required"),
  NEXTAUTH_URL: z.string().url("NEXTAUTH_URL must be a valid URL"),
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required"),
});

// Note: We use a function to validate so the app shows clear errors at startup
function validateEnv() {
  // Skip validation during build time when env vars may not be available
  if (process.env.NODE_ENV === "production" && !process.env.DATABASE_URL) {
    return {
      DATABASE_URL: "",
      NEXTAUTH_SECRET: "",
      NEXTAUTH_URL: "",
      GEMINI_API_KEY: "",
    };
  }

  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("❌ Invalid environment variables:", parsed.error.flatten().fieldErrors);
    // Don't throw during build
    return {
      DATABASE_URL: process.env.DATABASE_URL ?? "",
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ?? "",
      NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? "http://localhost:3000",
      GEMINI_API_KEY: process.env.GEMINI_API_KEY ?? "",
    };
  }
  return parsed.data;
}

export const env = validateEnv();
