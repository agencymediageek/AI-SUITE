---
name: WP TechSites Investor Demo
description: Demo live-build setup for investor meeting — endpoints, credentials, tested flows
---

## Demo site credentials
- DB site id: 1, api_key: `1238b9d0-8753-4b7a-9f66-26a016a0e1a0`
- WP site: `cwb.net.techsites.ai` (MyListing theme, WordPress Multisite subsite)
- WP user: `admin_6k23im5i` / Application Password in secret `WP_CWB_APP_PASSWORD`
- WP REST URL: `https://cwb.net.techsites.ai/wp-json`
- Credits: 5000 (topped up for demo)

## Endpoints added (all tested ✅)
- `GET /api/wp/listings` — listing count from WP (tries plugin endpoint → job_listing → posts)
- `POST /api/wp/demo` — live-build: generates listings + imports + updates tagline/title
- `POST /api/wp/chat-editor` — now handles: create_listing, create_directory_page, update_site_title (in addition to tagline/option/post)

## wpCreateListing helper
All listing imports now use `wpCreateListing()` which tries in order:
1. `/wp-techsites/v1/listings` (plugin v2.1.0 custom endpoint)
2. `/wp/v2/job_listing` (standard WP REST if plugin enables show_in_rest)
3. `/wp/v2/posts` (always available — fallback)

**Why:** Plugin v2.1.0 may not yet be installed on all client sites; fallback ensures demo always works.

## BrightData status
- Dataset `gd_l7q7dkf244hwjntr0` WORKS for Curitiba (hotéis, restaurantes confirmed)
- Returns real Google Maps data with addresses, ratings, phone numbers
- Fallback: `generateDemoListings()` via Gemini/Grok if BrightData empty

## Plugin v2.1.0
- ZIP: `artifacts/wp-techsites-plugin/wp-techsites-plugin-v2.1.0.zip` (36961 bytes)
- Header version fixed to 2.1.0 (was 2.0.0 in header, 2.1.0 in constant)
- New actions in `wpts_apply_chat_action`: create_listing, create_post, create_directory_page, update_site_title
- Needs manual install on cwb.net.techsites.ai for plugin REST endpoint to work (post fallback works without it)

## Demo live-build script (investor meeting)
```
POST /api/wp/demo
{ "category": "restaurantes", "city": "Curitiba", "count": 5,
  "tagline": "O melhor guia gastronômico de Curitiba", "site_title": "Guia CWB" }
```
Takes ~26s, imports 5 real listings, updates tagline and title, returns step-by-step log.

## Demo chat-editor commands (live during meeting)
- "adiciona o restaurante X na Rua Y, nota 4.8" → creates listing immediately
- "muda a tagline para Y" → updates WP tagline live
- "muda o título do site para Z" → updates site title live
- "cria a página do diretório chamada Guia de Curitiba" → creates page with [wpts_directory]
- "cria um post sobre turismo em Curitiba" → publishes article
