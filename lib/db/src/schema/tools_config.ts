import { pgTable, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const toolsConfigTable = pgTable("tools_config", {
  id: text("id").primaryKey(),
  n8nWebhookUrl: text("n8n_webhook_url"),
  usageCount: integer("usage_count").notNull().default(0),
  isEnabled: boolean("is_enabled").notNull().default(true),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type ToolConfig = typeof toolsConfigTable.$inferSelect;
