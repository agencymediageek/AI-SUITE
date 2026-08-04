---
name: Users table migration
description: Stripe/payment columns added to Drizzle schema but missing from older PostgreSQL DBs
---

## Problem
`usersTable` in `lib/db/src/schema/users.ts` has `payment_gateway`, `stripe_customer_id`, `stripe_subscription_id` but these columns weren't in the actual DB, causing every auth query to fail with "column does not exist".

## Fix applied
`artifacts/api-server/src/app.ts` runs idempotent migration on startup:
```ts
ALTER TABLE users ADD COLUMN IF NOT EXISTS payment_gateway TEXT
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT
```

**Why:** Drizzle doesn't auto-migrate in production — schema changes require explicit migration or startup DDL.

**How to apply:** Any new column added to `usersTable` must also be added to the startup migration block in `app.ts`, OR a proper Drizzle migration file must be created and run.
