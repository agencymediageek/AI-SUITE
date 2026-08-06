---
name: WP TechSites N8N-first pattern
description: Architecture for POST /wp/execute unified endpoint, N8N routing, and NULL credits fix
---

## The Pattern (standard for all new SaaS)

**Static layer:** `artifacts/api-server/src/lib/wp-tools-data.ts`
- Defines every tool: id, creditCost, systemPrompt, n8nDefaultPath, plan gate
- `n8nDefaultPath` = webhook path on n8n.xbest.cloud (null = AI direct only)

**DB config layer:** `wp_tools_config` table
- id, n8n_webhook_url, usage_count, is_enabled
- Seeded at startup from WP_TOOLS where n8nDefaultPath != null (ON CONFLICT DO NOTHING)
- Admin can override URLs without code change

**Execution endpoint:** `POST /api/wp/execute`
- Auth: X-WP-Site-Key
- Body: { toolId, inputs, language }
- Routing: query wp_tools_config → N8N if URL found → GROK fallback
- N8N fallback trigger: any of (empty body, non-2xx, timeout, unreachable)

## Critical: N8N Response Handling

N8N webhooks on n8n.xbest.cloud currently return HTTP 200 with **empty body** 
(workflows receive but don't have "Respond to Webhook" returning content yet).

**Fix:** `executeWpTool()` uses `response.text()` NOT `response.json()`:
- Empty body → silently fall through to GROK
- Non-JSON body → use as-is
- JSON body → extract text|output|content|result

**Why:** `response.json()` throws "Unexpected end of JSON input" on empty body.

## N8N Seeds (seocontent-audit, seocontent-v4, ts-chat-editor-intake)

These 3 tools have N8N URLs seeded. They currently route to GROK because N8N 
returns empty bodies. When N8N workflows are configured with "Respond to Webhook",
they will auto-route to N8N without any code change.

## NULL Credits Fix (Task #104)

Root cause: ALTER TABLE ADD COLUMN doesn't set DEFAULT on existing rows in some 
Postgres configs → credit_balance = NULL → `null < 5 === true` → all tools 402.

Fix applied in TWO places (belt + suspenders):
1. `app.ts` startup: `UPDATE wp_sites SET credit_balance=150 WHERE credit_balance IS NULL`
2. `ensureWpSitesTable()`: same UPDATE after table creation
3. `POST /wp/register`: explicit `creditBalance: 150` (never trust DB DEFAULT alone)
4. `POST /wp/execute`: `const balance = site.creditBalance ?? 0` (null-safe compare)

## Files

- `artifacts/api-server/src/lib/wp-tools-data.ts` — static tool registry
- `lib/db/src/schema/wp-tools-config.ts` — Drizzle schema
- `artifacts/api-server/src/routes/wp-techsites.ts` — executeWpTool() + POST /wp/execute
- `artifacts/api-server/src/app.ts` — startup NULL credits fix
- `docs/architecture/wp-techsites-n8n-pattern.md` — full architecture doc (in GitHub)
