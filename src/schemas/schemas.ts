import { z } from "zod";

export const AddressSchema = z.object({
  address_line: z.string().min(1),
  locality: z.string().min(1),
  postal_code: z.string().min(1),
  country_code: z.string().min(1),
});

export const ExtendedAddressSchema = AddressSchema.extend({
  latitude: z.number().min(1),
  longitude: z.number().min(1),
});

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  confirm_password: z.string().min(8),
  business_name: z.string().min(1),
  restaurant_name: z.string().min(1),
  card: z.string().length(16), // this will probably change
  address: AddressSchema,
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const BusinessSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(1),
  card: z.string().length(16),
  refresh_token: z.string().optional(),
});

export const RestaurantSchema = z.object({
  id: z.string().min(1),
  business_id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  affordability: z.string().optional(),
  logo_file_path: z.string().optional(),
  cover_file_path: z.string().optional(),
});

export const EnvSchema = z.object({
  ENV: z.string().min(1),
  API_PORT: z.string().min(1),
  DB_USER: z.string().min(1),
  DB_PWD: z.string().min(1),
  DB_HOST: z.string().min(1),
  DB_PORT: z.string().min(1),
  ACCESS_TOKEN_SECRET: z.string().min(1),
  REFRESH_TOKEN_SECRET: z.string().min(1),
  ACCESS_TOKEN_EXPIRY: z.string().min(1),
  REFRESH_TOKEN_EXPIRY: z.string().min(1),
  GOOGLE_ADDRESS_VALIDATION_URL: z.string().min(1),
});
