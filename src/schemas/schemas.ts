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
  business_name: z.string(),
  card: z.string().length(16), // this will probably change
  address: AddressSchema,
});

export const EnvSchema = z.object({
  ENV: z.string().min(1),
  API_PORT: z.string().min(1),
  DB_USER: z.string().min(1),
  DB_PWD: z.string().min(1),
  DB_HOST: z.string().min(1),
  DB_PORT: z.string().min(1),
  GOOGLE_ADDRESS_VALIDATION_URL: z.string().min(1),
});
