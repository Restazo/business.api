import { z } from "zod";

export const AddressSchema = z.object({
  address_line: z.string().min(1),
  city: z.string().min(1),
  postal_code: z.string().min(1),
  country_code: z.string().min(1),
});

export const ExtendedAddressSchema = AddressSchema.extend({
  latitude: z.string().min(1),
  longitude: z.string().min(1),
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
  refresh_token: z.string().nullable(),
});

export const RestaurantSchema = z.object({
  id: z.string().min(1),
  business_id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().nullable(),
  affordability: z.number(),
  logo_file_path: z.string().nullable(),
  cover_file_path: z.string().nullable(),
  listed: z.boolean(),
});

export const ProfileResponseSchema = z.array(
  z.object({
    restaurant: RestaurantSchema.extend({
      address: ExtendedAddressSchema,
    }).omit({ business_id: true }),
  })
);

export const MenuItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  image: z.string().nullable(),
  description: z.string().min(1).nullable(),
  ingredients: z.string().min(1).nullable(),
  priceAmount: z.string().min(1),
  priceCurrency: z.string().min(1),
});

export const MenuSchema = z.array(
  z.object({
    categoryId: z.string().min(1),
    categoryLabel: z.string().min(1),
    categoryItems: z.array(MenuItemSchema),
  })
);

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
});
