import * as z from "zod";

import { AddressSchema, ExtendedAddressSchema } from "./schemas.js";

export type Address = z.infer<typeof AddressSchema>;

export type ExtendedAddress = z.infer<typeof ExtendedAddressSchema>;

export type AddressValidationResult = {
  data?: ExtendedAddress;
} | null;
