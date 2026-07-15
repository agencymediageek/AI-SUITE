import { pgTable, serial, text, integer, real, boolean, timestamp } from "drizzle-orm/pg-core";

export const plansTable = pgTable("plans", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: real("price").notNull(),
  interval: text("interval").notNull().default("monthly"),
  tokenAllowance: integer("token_allowance").notNull(),
  features: text("features").notNull().default("[]"), // JSON array stored as text
  isPopular: boolean("is_popular").notNull().default(false),
  woocommerceProductId: integer("woocommerce_product_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Plan = typeof plansTable.$inferSelect;
