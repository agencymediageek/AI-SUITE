import { pgTable, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";

/**
 * wp_tools_config
 * Per-tool configuration for WP TechSites.
 * Mirrors the pattern used by toolsConfigTable in the AI Suite.
 *
 * id            → tool ID: "seo-audit", "generate-content", "chat-editor", etc.
 * n8nWebhookUrl → full N8N webhook URL (null = fallback to direct GROK)
 * usageCount    → total executions across all sites (for analytics)
 * isEnabled     → soft-disable a tool without removing it
 */
export const wpToolsConfigTable = pgTable("wp_tools_config", {
  id: text("id").primaryKey(),
  n8nWebhookUrl: text("n8n_webhook_url"),
  usageCount: integer("usage_count").notNull().default(0),
  isEnabled: boolean("is_enabled").notNull().default(true),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type WpToolConfig = typeof wpToolsConfigTable.$inferSelect;
