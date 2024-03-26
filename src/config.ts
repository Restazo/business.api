import dotenv from "dotenv";

import { EnvSchema } from "./schemas/schemas.js";

dotenv.config();

try {
  EnvSchema.parse(process.env);
} catch (error) {
  console.log("Missing environmental variables. Check your .env file.");
  console.log("Terminating application...");
  process.exit(1);
}
