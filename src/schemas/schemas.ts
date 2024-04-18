import { z } from "zod";

const toNumber = z.number().or(z.string()).pipe(z.coerce.number());
const PriceSchema = toNumber.refine(
  (value) => value == parseFloat(value.toFixed(2)) && value >= 0
);
export const UUIDSchema = z.string().uuid();

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
  id: UUIDSchema,
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(1),
  card: z.string().length(16),
  refresh_token: z.string().nullable(),
});

export const RestaurantSchema = z.object({
  id: UUIDSchema,
  business_id: UUIDSchema,
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
});

export const EditProfileTextReqSchema = z
  .object({
    description: z.string().optional(),
    affordability: z.number().int().min(1).max(3).optional(),
    listed: z.boolean().optional(),
  })
  .strict();

/* *********************** Table schemas *********************** */
export const TableSchema = z.object({
  id: UUIDSchema,
  restaurantId: UUIDSchema,
  label: z.string().min(1),
  capacity: toNumber.pipe(z.number().int().min(1).max(30)),
});

export const CreateTableReqSchema = z.object({
  label: z.string().min(1),
  capacity: toNumber.pipe(z.number().int().min(1).max(30)),
});

export const DeleteTableParamSchema = z.object({
  restaurantId: UUIDSchema,
  tableId: UUIDSchema,
});

/* *********************** Menu schemas *********************** */

export const MenuItemSchema = z.object({
  id: UUIDSchema,
  categoryId: UUIDSchema,
  name: z.string().min(1),
  image: z.string().nullable(),
  description: z.string().min(1).nullable(),
  ingredients: z.string().min(3),
  priceAmount: PriceSchema,
  priceCurrency: z.enum(["eur", "usd"]),
});

export const MenuCategorySchema = z.object({
  id: UUIDSchema,
  restaurantId: UUIDSchema,
  label: z.string().min(1),
});

export const MenuSchema = z.array(
  z.object({
    categoryId: UUIDSchema,
    categoryLabel: z.string().min(1),
    categoryItems: z.array(MenuItemSchema.omit({ categoryId: true })),
  })
);

export const CreateOrEditMenuCategoryReqSchema = z.object({
  label: z.string().min(1),
});

export const AddMenuItemReqSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  ingredients: z.string().min(3),
  priceAmount: PriceSchema,
  priceCurrency: z.enum(["eur", "usd"]),
});

export const EditMenuItemReqSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  ingredients: z.string().min(3).optional(),
  priceAmount: PriceSchema.optional(),
  priceCurrency: z.enum(["eur", "usd"]).optional(),
  deleteItemImage: z
    .string()
    .refine((value) => value === "true")
    .optional(),
});

/* *********************** Waiter schemas *********************** */
export const WaiterSchema = z.object({
  id: UUIDSchema,
  restaurantId: UUIDSchema,
  email: z.string().email(),
  name: z.string().min(1),
});

export const RegisterWaiterReqSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
});

export const RegisterWaiterResSchema = RegisterWaiterReqSchema.extend({
  pin: z.string().length(5),
});
