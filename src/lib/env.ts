import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_DIRECTUS_URL: z.string().url().optional(),
  OPENAI_API_KEY: z.string().optional(),
});

export function validateEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        `Missing required environment variables: ${Object.keys(errors).join(", ")}`,
      );
    }
    console.warn("Environment variable validation warnings:", errors);
  }

  return parsed.data;
}
