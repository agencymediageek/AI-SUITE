---
name: WP TechSites
description: Architecture and auth model for the WP TechSites product (WordPress plugin + SaaS dashboard)
---

## Auth model
- NO JWT. Customers identify via `X-WP-Site-Key` header (UUID API key stored in localStorage as `wpts_api_key`).
- Key is created via `POST /api/wp/register` (no auth required).
- All other `/api/wp/*` routes require `X-WP-Site-Key` header validated by `requireSiteKey` middleware in `wp-techsites.ts`.
- Dashboard checks localStorage on load → calls `useVerifyWpSite` → if invalid, shows registration screen.

## API routes
All routes mounted in `artifacts/api-server/src/routes/wp-techsites.ts`, registered in `routes/index.ts`.
- POST /api/wp/register — create account (no auth)
- GET  /api/wp/verify  — verify key, returns site info + tools
- POST /api/wp/chat    — chatbot (1 credit/msg)
- POST /api/wp/generate-content — AI content gen (5 credits)
- POST /api/wp/apply-colors     — brand CSS (2 credits)
- POST /api/wp/generate-menu    — menu suggestions (3 credits)
- GET  /api/wp/tools    — list available tools
- GET  /api/wp/dashboard — dashboard data

## DB
Table `wp_sites` defined in `lib/db/src/schema/wp-sites.ts`. Created via `CREATE TABLE IF NOT EXISTS` on startup (idempotent, no migration needed).

## WordPress plugin
Files at `artifacts/wp-techsites-plugin/`:
- `wp-techsites.php` — full plugin: admin menu, settings, AJAX actions, chatbot injection, CSS injection
- `assets/chatbot.js` — standalone chatbot widget (reads config from `data-wpts-*` attributes on script tag)
- `wp-techsites-plugin-v1.0.0.zip` — ready-to-install zip

Plugin demo actions (WP admin → WP TechSites → Ferramentas IA):
1. Generate content → calls `/api/wp/generate-content` → creates WP page/post via AJAX
2. Apply colors → calls `/api/wp/apply-colors` → injects CSS preview + saves via AJAX
3. Generate menu → calls `/api/wp/generate-menu` → applies to primary nav via AJAX

## Customer dashboard
Artifact: `artifacts/wp-techsites` at `/wp-techsites/`. Routes:
- `/` — registration + existing key entry
- `/dashboard` — credits, plan, tools grid
- `/tools/content`, `/tools/colors`, `/tools/menu` — tool pages
- `/setup` — plugin installation guide

**Why:** Custom auth header (not JWT) means the generated Orval hooks must receive `{ request: { headers: { 'X-WP-Site-Key': apiKey } } }` on every call, not rely on a global interceptor.
