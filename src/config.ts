import dotenv from "dotenv";
import { z } from "zod";

import { EnvSchema } from "schemas/schemas.js";

dotenv.config();

try {
  EnvSchema.parse(process.env);
} catch (error) {
  console.log("Missing environmental variables. Check your .env file.");
  console.log("Terminating application...");
  process.exit(1);
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof EnvSchema> {}
  }
}
