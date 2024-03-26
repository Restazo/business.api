import { Request } from "express";
import { ExtendedRequestSchema, EnvSchema } from "./schemas/schemas.ts";
import { Business } from "./schemas/types.js";
import { z } from "zod";

declare global {
  namespace Express {
    interface Request {
      user: Business | null;
    }
  }
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof EnvSchema> {}
  }
}
