import { pgTable, serial, integer, text } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const whitelabelConfigsTable = pgTable("whitelabel_configs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique().references(() => usersTable.id, { onDelete: "cascade" }),
  aiName: text("ai_name").notNull().default("APEX CORE"),
  logoUrl: text("logo_url"),
  primaryColor: text("primary_color").notNull().default("#00FF41"),
  accentColor: text("accent_color").notNull().default("#00FFFF"),
  companyName: text("company_name"),
  subdomain: text("subdomain").unique(),
});

export type WhitelabelConfig = typeof whitelabelConfigsTable.$inferSelect;
export type InsertWhitelabelConfig = typeof whitelabelConfigsTable.$inferInsert;
