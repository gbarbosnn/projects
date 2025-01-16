import { z } from 'zod';
import 'dotenv/config';

const envSchema = z.object({
  DATABASE_URL: z.string(),
  API_BASE_URL: z.string().url(),
  AUTH_REDIRECT_URL: z.string().url(),
  JWT_SECRET: z.string(),

  EXCHANGE_EMAIL: z.string(),
  EXCHANGE_PASSWORD: z.string(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('Invalid environment variables', parsedEnv.error.flatten().fieldErrors);

  throw new Error('Invalid environment variables');
}

export const env = parsedEnv.data;