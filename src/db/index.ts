import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
if (!process.env.DATABASE_URL)
  throw new Error("DATABASE_URL is missing from .env");

export const db = drizzle({
  connection: { connectionString: process.env.DATABASE_URL },
  schema,
});
