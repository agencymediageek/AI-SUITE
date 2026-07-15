import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const generationsTable = pgTable("generations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  toolId: text("tool_id").notNull(),
  toolLabel: text("tool_label").notNull(),
  prompt: text("prompt"),
  output: text("output"),
  tokensUsed: integer("tokens_used").notNull().default(0),
  model: text("model"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertGenerationSchema = createInsertSchema(generationsTable).omit({ id: true, createdAt: true });
export type InsertGeneration = z.infer<typeof insertGenerationSchema>;
export type Generation = typeof generationsTable.$inferSelect;
