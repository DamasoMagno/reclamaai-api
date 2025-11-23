import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, { message: "DATABASE_URL is required" }),
  PORT: z.coerce.number().min(1, { message: "PORT is required" }).default(3000),
  SECRET_KEY: z.string().min(1, { message: "SECRET_KEY is required" }),
  OPENAI_API_KEY: z.string().min(1, { message: "OPENAI_API_KEY is required" }),
});

export const env = envSchema.parse(process.env);
