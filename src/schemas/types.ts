import * as z from "zod";
import { JwtPayload } from "jsonwebtoken";

import {
  AddressSchema,
  ExtendedAddressSchema,
  BusinessSchema,
  RestaurantSchema,
  MenuSchema,
  TableSchema,
} from "./schemas.js";

export type JwtCustomPayload = JwtPayload & {
  id: string;
  email: string;
  name: string;
};

export type Address = z.infer<typeof AddressSchema>;

export type ExtendedAddress = z.infer<typeof ExtendedAddressSchema>;

export type Business = z.infer<typeof BusinessSchema>;

export type Restaurant = z.infer<typeof RestaurantSchema>;

export type Menu = z.infer<typeof MenuSchema>;

export type Table = z.infer<typeof TableSchema>;

export type AddressValidationResult = {
  data?: ExtendedAddress;
} | null;
