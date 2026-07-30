import { pgTable, serial, integer, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { meetingsTable } from "./meetings";

export const sessionStatusEnum = pgEnum("session_status", ["active", "ended"]);

export const meetingSessionsTable = pgTable("meeting_sessions", {
  id: serial("id").primaryKey(),
  meetingId: integer("meeting_id").notNull().references(() => meetingsTable.id, { onDelete: "cascade" }),
  status: sessionStatusEnum("status").notNull().default("active"),
  transcript: text("transcript"),
  summary: text("summary"),
  builtAssets: text("built_assets").array().notNull().default([]),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  endedAt: timestamp("ended_at"),
});

export type MeetingSession = typeof meetingSessionsTable.$inferSelect;
export type InsertMeetingSession = typeof meetingSessionsTable.$inferInsert;
