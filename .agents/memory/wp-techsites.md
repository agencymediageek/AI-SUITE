---
name: WP TechSites Plugin
description: Architecture and decisions for the WP TechSites WordPress plugin (Trojan Horse SaaS strategy)
---

## Plugin v2.0.0 — Multi-file structure

```
artifacts/wp-techsites-plugin/
├── wp-techsites.php           # Main file, constants, module loader, chatbot hook
├── includes/
│   ├── theme-detector.php     # wpts_detect_theme() → structured info; wpts_get_site_audit_data()
│   ├── cpt-listings.php       # CPT wpts_listing + taxonomies wpts_category + wpts_city
│   └── ajax-handlers.php      # All wp_ajax_wpts_* handlers + [wpts_directory] shortcode
└── admin/
    └── admin-page.php         # Admin menu + all page renderers (dashboard, audit, directory, scraping, listings, logo, content, branding, menu, chatbot, monetize, chat-editor, settings)
assets/
├── admin.css                  # Full SaaS-style admin UI (dark sidebar, cards, animations)
├── admin.js                   # All admin JS interactions
└── chatbot.js                 # Frontend chatbot widget (no jQuery dependency)
```

## Key design decisions

**Why:** Plugin is a "Trojan Horse" — it's a full SaaS platform embedded inside the client's WordPress. Every tool is active (no "coming soon"), giving the impression of a complete ecosystem.

**Theme detection** on activation: `wpts_detect_theme()` maps 15+ known themes (MyListing, BeTheme, Divi, Elementor, Astra, etc.) to structured info including type, color, features. Used in dashboard banner.

**SEO Audit** is the first product/entry point: runs automatically on plugin activation, generates score (0-100), grade (A-D), checklist with ok/warn/fail/info items. Has local fallback if API is down. Exports as PDF via html2pdf.js CDN.

**Directory Builder**: creates `wpts_listing` CPT + `wpts_category` + `wpts_city` taxonomies, creates archive page with `[wpts_directory]` shortcode, all on one click.

**Logo Builder**: two tabs — AI generation (calls API) + Manual compositor (live preview with icon grid, color pickers, font selector, no API needed).

**Monetization recommendation**: WooCommerce (Stripe + PagSeguro + PayPal) OR WP TechSites gateway (5% fee, D+2 repasse). Dedicated page in admin.

**Payment for premium listings**: WooCommerce-first recommendation with gateway option via wp.techsites.ai.

## API endpoints the plugin calls (must exist in api-server)

All at `WPTS_API_BASE = https://wp.techsites.ai/api/wp`:
- `POST /audit/seo` — receives site data, returns audit object
- `POST /generate-content` — topic, type, tone, length, lang
- `POST /generate-colors` — niche, style → palettes array
- `POST /generate-menu` — niche, language → menuItems array
- `POST /generate-logo` — brand_name, style, colors → image_url or svg
- `POST /scraping/run` — category, city, limit, save_to → listings array
- `POST /chatbot` — messages array → reply string
- `POST /chat-editor` — command, context → actions array + message

## Three business models

1. **Plugin Solo**: client has own WP, installs plugin, gets API key
2. **Migration + Plugin**: migrate to net.techsites.ai, install plugin
3. **Full Service**: new WP on net.techsites.ai (BeTheme/MyListing) + plugin + hosting

## WordPress hosting environment (coming)

`net.techsites.ai` — dedicated WP install, multi-domain, fixed IP, MyListing + BeTheme themes. This is where models 2 and 3 clients are hosted.

## ZIP packages

- `wp-techsites-plugin-v2.0.0.zip` — current version (34KB)
- `wp-techsites-plugin-v1.1.0.zip` — previous version
- `wp-techsites-plugin-v1.0.0.zip` — original version
