import { pgTable, serial, integer, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const meetingStatusEnum = pgEnum("meeting_status", ["active", "archived"]);

export const meetingsTable = pgTable("meetings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  company: text("company"),
  companyUrl: text("company_url"),
  logoUrl: text("logo_url"),
  aiName: text("ai_name").notNull().default("APEX CORE"),
  language: text("language").notNull().default("pt"),
  resources: text("resources").array().notNull().default([]),
  briefingText: text("briefing_text"),
  status: meetingStatusEnum("status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Meeting = typeof meetingsTable.$inferSelect;
export type InsertMeeting = typeof meetingsTable.$inferInsert;
