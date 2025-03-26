import dotenv from "dotenv";
import { type Config } from "drizzle-kit";

dotenv.config({
  path: ".env.local",
});

const drizzleConfig = {
  schema: "./src/db/schema.ts",
  out: "./migrations",
  dialect: "turso",
  casing: "snake_case",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_AUTH_TOKEN!,
  },
  tablesFilter: ["with-drizzle_*"],
} satisfies Config;

export default drizzleConfig;
