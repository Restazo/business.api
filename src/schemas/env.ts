import { z } from "zod";

export const EnvSchema = z.object({
  ENV: z.string().min(1),
  API_PORT: z.string().min(1),
  ASSETS_URL: z.string().min(1),
  DB_USER: z.string().min(1),
  DB_PWD: z.string().min(1),
  DB_HOST: z.string().min(1),
  DB_PORT: z.string().min(1),
  DB_DATABASE: z.string().min(1),
  ACCESS_TOKEN_SECRET: z.string().min(1),
  REFRESH_TOKEN_SECRET: z.string().min(1),
  ACCESS_TOKEN_EXPIRY: z.string().min(1),
  REFRESH_TOKEN_EXPIRY: z.string().min(1),
  GOOGLE_ADDRESS_VALIDATION_URL: z.string().min(1),
  ALLOWED_FILE_TYPES: z.string().min(1),
  FILE_SIZE_LIMIT: z.string().min(1),
  ITEM_IMAGE_UPLOAD_PATH: z.string().min(1),
  COVER_IMAGE_UPLOAD_PATH: z.string().min(1),
  LOGO_IMAGE_UPLOAD_PATH: z.string().min(1),
  ENCRYPTION_SECRET: z.string().length(64),
});