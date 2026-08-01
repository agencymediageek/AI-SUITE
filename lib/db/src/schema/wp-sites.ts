import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const wpSitesTable = pgTable("wp_sites", {
  id: serial("id").primaryKey(),
  apiKey: text("api_key").unique().notNull(),
  siteUrl: text("site_url").notNull(),
  siteName: text("site_name").notNull().default(""),
  ownerEmail: text("owner_email").notNull(),
  ownerName: text("owner_name").notNull().default(""),
  creditBalance: integer("credit_balance").notNull().default(100),
  isActive: boolean("is_active").notNull().default(true),
  plan: text("plan").notNull().default("trial"), // trial | starter | pro
  // WP REST API write-back credentials (stored after /connect-rest)
  wpUser: text("wp_user").notNull().default(""),
  wpAppPassword: text("wp_app_password").notNull().default(""),
  wpRestUrl: text("wp_rest_url").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }),
});
