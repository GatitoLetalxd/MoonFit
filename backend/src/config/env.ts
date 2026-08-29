import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_ACCESS_SECRET: z.string().min(16, 'JWT_ACCESS_SECRET must be at least 16 chars'),
  JWT_REFRESH_SECRET: z.string().min(16, 'JWT_REFRESH_SECRET must be at least 16 chars'),
  JWT_ACCESS_EXPIRATION: z.string().default('15m'),
  JWT_REFRESH_EXPIRATION_DAYS: z.coerce.number().default(30),
  STORAGE_PATH: z.string().default('./storage'),
  ADMIN_INITIAL_EMAIL: z.string().email().default('rogeeromontufar@gmail.com'),
  ADMIN_INITIAL_PASSWORD: z.string().default('72091907'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:', parsedEnv.error.format());
  process.exit(1);
}

export const env = {
  ...parsedEnv.data,
  port: parseInt(parsedEnv.data.PORT, 10),
  isProduction: parsedEnv.data.NODE_ENV === 'production',
  resolvedStoragePath: path.resolve(process.cwd(), parsedEnv.data.STORAGE_PATH),
};
