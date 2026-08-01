---
name: APEX Core subscriptions
description: Stripe subscription implementation for APEX CORE MEETING — what changed and how it works
---

## Planos (hardcoded em api-server/src/routes/plans.ts — upsert on startup)

| ID | Preço | Intervalo | Tokens |
|-----|------|-----------|--------|
| starter | $57 | monthly | 500 |
| pro | $134 | monthly | 2000 |
| single-meeting | $27 | one-time | 100 |
| enterprise | $0 | monthly | 999999 |

**Why:** plans route owns canonical prices; DB is always overwritten on startup.

## Stripe webhook (we_1TzKyhK1Gb20xyZUDFcPTweV)

URL: https://apex.techsites.ai/api/payments/stripe/webhook
Events: checkout.session.completed, invoice.payment_succeeded, invoice.payment_failed, customer.subscription.deleted, customer.subscription.updated

Secret stored in: `/var/www/mediageek/artifacts/api-server/.env.local` → STRIPE_WEBHOOK_SECRET

## Subscription flow

- Monthly plans → Stripe mode='subscription' + recurring={interval:'month'}
- Single-meeting → Stripe mode='payment' (one-time)
- Customer created/retrieved in stripe.customers, stored in users.stripe_customer_id
- After checkout: stripe_subscription_id saved from checkout.session.completed
- Monthly renewal: invoice.payment_succeeded → activatePlan (credits tokens)
- Cancellation: customer.subscription.deleted → clears planId, planName, planExpiresAt
- Cancel endpoint: POST /api/payments/stripe/cancel → cancel_at_period_end: true

## DB changes (apex DB on VPS)

ALTER TABLE users ADD COLUMN stripe_customer_id text, stripe_subscription_id text;

**Why:** needed to associate users with Stripe customers/subscriptions for lifecycle management.

## Token key bug fixed

CheckoutModal.tsx: apex_token → apex_meeting_token (auth store uses apex_meeting_token)
