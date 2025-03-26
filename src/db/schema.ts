// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration
// https://orm.drizzle.team/docs/column-types/sqlite

import { InferSelectModel, sql } from "drizzle-orm";
import { int, sqliteTableCreator, text } from "drizzle-orm/sqlite-core";

export const sqliteTable = sqliteTableCreator(
  (name: string) => `with-drizzle_${name}`
);

export const files = sqliteTable("files", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  key: text().notNull(),
  url: text().notNull(),
  uploadedBy: text().references(() => users.fid),
  createdAt: int({ mode: "timestamp" }).$defaultFn(
    () => sql`CURRENT_TIMESTAMP`
  ),
  updatedAt: int({ mode: "timestamp" }).$defaultFn(
    () => sql`CURRENT_TIMESTAMP`
  ),
});

export type File = InferSelectModel<typeof files>;

export const users = sqliteTable("users", {
  fid: text().primaryKey(),
  name: text().notNull(),
  pfp: text().notNull(),
  createdAt: int({ mode: "timestamp" }).$defaultFn(
    () => sql`CURRENT_TIMESTAMP`
  ),
  updatedAt: int({ mode: "timestamp" }).$defaultFn(
    () => sql`CURRENT_TIMESTAMP`
  ),
});

export type User = InferSelectModel<typeof users>;
