---
name: Architecture Decisions
description: Core SaaS architecture choices and rationale for the AI Suite platform
---

## Architecture

React Vite frontend (artifacts/ai-suite-platform) + Express API server (artifacts/api-server) + N8N webhooks + WooCommerce plugin.

**Why not Next.js or full PHP rebuild:** Too much work, wrong platform for real-time AI streaming in Replit.

**Why this stack:**
- Replit PostgreSQL + Drizzle ORM for persistence
- Express handles auth, tools catalog, AI proxy, admin
- N8N handles AI generation workflows (one workflow per tool category, 13 total)
- WooCommerce plugin sells access + manages token credits via a separate WordPress site

## Key paths
- Frontend: artifacts/ai-suite-platform/src/
- Backend routes: artifacts/api-server/src/routes/ (auth, tools, ai, user, plans, dashboard, admin)
- Tools static data: artifacts/api-server/src/lib/tools-data.ts
- DB schema: lib/db/src/schema/ (users, generations, favorites, plans, tools_config)
- N8N workflows: n8n-workflows/ (13 JSON files + ALL-WORKFLOWS-IMPORT.json)
- WordPress plugin: wordpress-plugin/ai-suite-woocommerce/

## Missing env vars to configure (user must set)
- GEMINI_API_KEY or GOOGLE_API_KEY — for direct Gemini fallback in AI route
- JWT_SECRET — for auth token signing (defaults to hardcoded string if missing)
- ADMIN_API_KEY — for WordPress plugin webhook auth
