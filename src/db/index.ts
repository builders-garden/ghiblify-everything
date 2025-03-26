import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

import { env } from "@/lib/env.mjs";

import * as schema from "./schema";

export const db = drizzle({
  client: createClient({
    url: env.DATABASE_URL,
    authToken: env.DATABASE_AUTH_TOKEN,
  }),
  casing: "snake_case",
  schema,
});
