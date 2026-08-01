---
name: WP TechSites
description: Plugin WP + dashboard SaaS; auth, REST write-back, endpoints, business models
---

# WP TechSites

## Plugin
- Version 2.1.0 at `artifacts/wp-techsites-plugin/`
- ZIP: `wp-techsites-plugin-v2.1.0.zip` (36K, ready to install)
- `WPTS_API_BASE` hardcoded to `https://wp.techsites.ai/api/wp`
- Auth: `X-WP-Site-Key` header (not JWT); sites stored in `wp_sites` table

## DB Schema (`lib/db/src/schema/wp-sites.ts`)
Table `wp_sites` columns: id, api_key, site_url, site_name, owner_email, owner_name,
credit_balance, is_active, plan, **wp_user**, **wp_app_password**, **wp_rest_url**,
created_at, last_seen_at

## API Endpoints (all at `/api/wp/`)
- `POST /register` — create account, returns apiKey
- `GET /verify` — confirm key is valid
- `POST /connect-rest` — save WP REST credentials, validates against WP users/me
- `POST /chat` — chatbot (single message)
- `POST /chatbot` — chatbot (messages array)
- `POST /audit/seo` — SEO audit (Gemini/Grok + local fallback)
- `POST /generate-content` — AI content generator
- `POST /apply-colors` — apply color palette
- `POST /generate-menu` — generate nav menu
- `POST /generate-logo` — SVG logo via AI
- `POST /generate-colors` — color palettes
- `POST /scraping/run` — BrightData → Gemini/Grok fallback; **auto-imports to WP via REST when connected**
- `POST /chat-editor` — natural language WP editor; **executes actions directly in WP when connected**
- `GET /tools` — available tools for plan
- `GET /dashboard` — site stats

## WP REST Write-Back
- Activated via `POST /connect-rest` with `{wp_user, wp_app_password, wp_rest_url}`
- `wpCall(site, path, method, body)` helper in wp-techsites.ts
- scraping/run: creates `job_listing` via `/wp-techsites/v1/listings` (custom endpoint in plugin), falls back to `wp/v2/posts`
- chat-editor: executes update_tagline, update_option, create_post directly in WP
- Plugin registers custom REST route: `POST /wp-json/wp-techsites/v1/listings` — handles job_listing CPT + meta fields

## MyListing CPT REST
- Plugin adds filter `register_post_type_args` to enable REST for: job_listing, listing, wpts_listing, wpjm_job
- Custom endpoint `/wp-json/wp-techsites/v1/listings` (GET + POST) handles listing creation with full meta

## AI Fallback Chain
- Primary: Gemini 2.0 Flash Exp → 2.0 Flash → 1.5 Flash
- Fallback: Grok (grok-3-mini) via xAI API
- Silent quota errors (429) skip to next model

## Infrastructure
- `cwb.net.techsites.ai` — WordPress Multisite subsite, MyListing 2.16, WooCommerce active
- DNS: `*.net.techsites.ai` DNS-only (grey cloud) — Let's Encrypt cert on cPanel covers SANs
- `net.techsites.ai` — proxied (Cloudflare Universal SSL covers *.techsites.ai)
- WP admin username slug: `admin_6k23im5i`, display name: "admin"
- WP_CWB_APP_PASSWORD secret saved in Replit

## Business Models
1. Plugin-only: install + API key
2. Migration + plugin: move site + install
3. Full-service: build on net.techsites.ai + plugin + hosting
