import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const favoritesTable = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  toolId: text("tool_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Favorite = typeof favoritesTable.$inferSelect;
