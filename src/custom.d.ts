import { Request } from "express";
import { ExtendedRequestSchema } from "./schemas/schemas.ts";
import { EnvSchema } from "./schemas/env.ts";
import { Business, Restaurant } from "./schemas/types.js";
import { z } from "zod";

declare global {
  namespace Express {
    interface Request {
      user: Business;
      restaurantData?: Restaurant;
      multerError?: string;
    }
  }
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof EnvSchema> {}
  }
}
