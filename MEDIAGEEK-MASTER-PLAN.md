# 🧠 MediaGeek Agency — Master Project Plan
> **Maintained by Replit AI** | Last updated: July 2026
> Every product built in this ecosystem must have its own `BLUEPRINT.md` file.
> No asset ships without documentation. Read this file before touching any code.

---

## 🗺️ The Ecosystem at a Glance

```
                        ┌─────────────────────────────┐
                        │   MEDIAGEEK SAAS (ENGINE)   │
                        │   aisuite.mediageek.io       │
                        │   Grok AI + Bright Data      │
                        └─────────────┬───────────────┘
                                      │ REST API / Webhooks
           ┌──────────────────────────┼──────────────────────────┐
           ▼                          ▼                           ▼
   ┌───────────────┐        ┌─────────────────┐        ┌────────────────┐
   │   TECHSITES   │        │   PIXELFORGE    │        │  WP TEMPLATES  │
   │ (Static HTML) │        │ (Fiverr White   │        │ (Cavalo Troia) │
   │ Cloudflare    │        │  Label Builder) │        │ ThemeForest    │
   └───────────────┘        └─────────────────┘        └────────────────┘
           ▼                          ▼                           ▼
   ┌───────────────┐        ┌─────────────────┐        ┌────────────────┐
   │  TECHPROSPECT │        │   SEOCONTENT    │        │  DIRECTORIES   │
   │ (Lead Gen /   │        │ (Content +      │        │ (MyListing +   │
   │  Bright Data) │        │  KDP/Kindle)    │        │  cwb.site etc) │
   └───────────────┘        └─────────────────┘        └────────────────┘
                                      ▼
                             ┌─────────────────┐
                             │   APP FRAME     │
                             │ (iOS + Android  │
                             │  White Label)   │
                             └─────────────────┘
```

---

## ⚡ Priority Roadmap — Profit First

### TIER 1 — FAST MONEY (Build now, sell in days)

| # | Product | Revenue Model | Time to Build | Est. Monthly |
|---|---------|--------------|---------------|-------------|
| 1 | **WordPress + HTML Template** (Generic Business) | ThemeForest $39-79 + MediaGeek SaaS upsell | 3-4 days | $500-5k+ |
| 2 | **TechProspect** | SaaS subscription $29-99/mo (Bright Data leads) | 4-5 days | $2k-10k |
| 3 | **TechSites MVP** | Site creation + Cloudflare hosting $29-99/mo | 5-7 days | $3k-15k |

### TIER 2 — RECURRING ENGINE (Build next, compound monthly)

| # | Product | Revenue Model | Time to Build |
|---|---------|--------------|---------------|
| 4 | **PixelForge White Label** | Fiverr freelancers $99-299/mo per seat | 7-10 days |
| 5 | **SEOContent** | Content packs + KDP books $49-199/mo | 5-7 days |
| 6 | **MyListing Plugin** | Sell to 10k+ MyListing owners worldwide $79 one-time + SaaS | 7-10 days |

### TIER 3 — EMPIRE SCALE (Build after Tier 2 cash flows)

| # | Product | Revenue Model | Time to Build |
|---|---------|--------------|---------------|
| 7 | **Directory Network** (cwb.site, places.guide, etc.) | Premium listings, guides, ads | 10-14 days |
| 8 | **App Frame** (iOS + Android WebView) | White label app per client $199 setup + $49/mo | 14-21 days |
| 9 | **KDP/Kindle AI Module** | Book bundles, niche packages $99-499 | 7-10 days |

---

## 🏗️ Full Asset Registry

### ASSET 01 — MediaGeek SaaS (ENGINE) ✅ BUILT
- **Status:** Running on Replit → being migrated to VPS
- **Domain:** aisuite.mediageek.io (DNS propagating)
- **Stack:** React + Express + PostgreSQL + Gemini AI
- **Next actions:**
  - [ ] Set `GEMINI_API_KEY` in Replit secrets
  - [ ] Set `JWT_SECRET` shared with WordPress plugin
  - [ ] Replace Gemini with Grok API for cost reduction (10x cheaper)
  - [ ] Add Bright Data integration for scraping endpoints
  - [ ] Set up GitHub webhook → VPS auto-deploy pipeline
- **Blueprint:** `core-saas/BLUEPRINT.md`

---

### ASSET 02 — WordPress + HTML Template (CAVALO DE TROIA) 🔴 PRIORITY 1
- **Status:** Not started
- **What it is:** A clean, professional generic business template with 5-minute learning curve
- **Reference design:** https://ts-lawyer-accountant.pages.dev/
- **Deliverables:**
  - WordPress theme (child theme, ACF, Gutenberg blocks)
  - Static HTML version (Tailwind CSS, Vanilla JS, Lighthouse ≥90)
  - MediaGeek Connect Plugin (bundled inside)
- **The Trojan Horse mechanism:**
  - Template is sold on ThemeForest ($39-79) or MediaGeek store
  - On install: banner appears → "Activate AI features with your MediaGeek account"
  - Free tier = 50 credits → shows the power → upsells paid plan
- **Niche adaptations (same base, different configs):**
  - Legal / Accounting
  - Medical / Dental
  - Real Estate
  - Restaurant / Food
  - Generic Business
- **Sales channels:** ThemeForest, Envato, MediaGeek store, Fiverr
- **Blueprint:** `wp-plugins/mediageek-template/BLUEPRINT.md`

---

### ASSET 03 — TechProspect (LEAD MACHINE) 🔴 PRIORITY 2
- **Status:** Site exists (https://techprospect.waas.host/) — not functional
- **What it is:** AI-powered lead generation tool using Bright Data
- **Core features:**
  - Input: City + Niche (e.g., "Dentists in Miami")
  - Bright Data scrapes Google Maps / business directories
  - Grok AI enriches each lead (writes personalized outreach message)
  - Export: CSV / Google Sheet / WhatsApp automation via N8N
  - Data mirrored to MediaGeek Google Drive (our asset forever)
- **Monetization:**
  - Pay-per-lead OR subscription plans
  - Data accumulated in GDrive becomes our directory inventory (free)
- **Integration:** Webhooks to N8N → WhatsApp/Email outreach automation
- **Blueprint:** `core-saas/techprospect/BLUEPRINT.md`

---

### ASSET 04 — TechSites (SITE FACTORY) 🔴 PRIORITY 3
- **Status:** Site exists (https://techsites.ai/) — not functional
- **What it is:** Automated website creation platform (static HTML → Cloudflare Pages)
- **Flow:**
  1. Client answers Q&A (5 questions about business)
  2. Grok AI generates copy for all sections
  3. System clones HTML template, injects content
  4. Cloudflare Pages API deploys site in under 60 seconds
  5. Client receives live URL + access to SaaS editor
- **Hosting revenue:** Client pays monthly to keep site on our Cloudflare account
- **The SaaS Editor integration:**
  - Client logs into MediaGeek SaaS → "My Sites" section
  - WYSIWYG visual editor mirrors their live site
  - AI chat: "Change my hero to target dentists" → live update
  - Pushes changes via Cloudflare Pages API
- **Blueprint:** `cloudflare-workers/techsites/BLUEPRINT.md`

---

### ASSET 05 — PixelForge (FIVERR WHITE LABEL) 🟡 PRIORITY 4
- **Status:** Demo live (https://pixelforge.waas.host/) — chatbot not connected
- **What it is:** White label Fiverr-style platform for freelancers and agencies
- **3 monetization models:**
  1. **Direct Gig:** MediaGeek sells sites/services directly on Fiverr
  2. **White Label Seats:** Freelancers pay $99-299/mo for their own branded PixelForge
  3. **Meta-Gig:** Sell the full PixelForge setup to agencies for $1,000-2,000
- **Fiverr ID integration:**
  - Freelancer enters their Fiverr Seller ID
  - System auto-customizes their panel (scrapes profile pic, colors, name)
  - Their clients' requests flow through our API (they pay per use)
- **Chatbot fix:**
  - Current: Broken chatbot in footer
  - New: Full admin panel + plugin → all processing via MediaGeek SaaS backend
  - Visitor chatbot becomes a lead capture tool (collects name + WhatsApp)
- **Blueprint:** `cloudflare-workers/pixelforge/BLUEPRINT.md`

---

### ASSET 06 — SEOContent (CONTENT ENGINE) 🟡 PRIORITY 5
- **Status:** Site exists (https://seocontent.waas.host/) — not functional
- **What it is:** AI content generation at scale (articles, SEO pages, Q&A multiplier)
- **Core features:**
  - Long-tail keyword multiplier (1 keyword → 500 variations)
  - Q&A Schema.org generator (Google Featured Snippets targeting)
  - Bulk article generation via Grok (ultra-low cost per token)
  - One-page site factory: 1 product → 500 HTML pages on Cloudflare (mass traffic)
- **KDP/Kindle sub-module:**
  - Niche + genre input → full book outline
  - Chapter-by-chapter Grok generation
  - Auto-formatted .epub output ready for Amazon upload
  - Cover prompt generator (for Midjourney/DALL-E)
- **Blueprint:** `core-saas/seocontent/BLUEPRINT.md`

---

### ASSET 07 — MyListing Plugin (DIRECTORY AUTOMATION) 🟡 PRIORITY 6
- **Status:** Not started
- **What it is:** Plugin that connects MyListing WordPress theme to MediaGeek SaaS
- **Target market:** 10,000+ MyListing buyers worldwide (scrape showcase sites)
- **Core features:**
  - Q&A onboarding in SaaS panel (5 questions about directory niche)
  - Grok generates hundreds of listings (name, description, hours, photos)
  - Plugin injects via WP REST API (wp_insert_post) — never touches MyListing code
  - Custom field mapping (_listing_phone, _listing_gallery, etc.)
  - Bright Data populates real business data
  - Amazon affiliate products injected into relevant listings
  - Blog auto-population with SEO articles
- **Sales strategy:**
  - Scrape MyListing showcase sites → extract contact emails
  - Offer 3 free listings as demo → convert to paid SaaS plan
  - Sell plugin on ThemeForest/CodeCanyon ($49 + SaaS subscription)
- **Blueprint:** `wp-plugins/mylisting-connector/BLUEPRINT.md`

---

### ASSET 08 — Directory Network (PASSIVE INCOME SITES) 🟢 PRIORITY 7
- **Sites to launch:**
  - cwb.site — Yellow Pages Curitiba
  - places.guide — Global travel directory
  - hub.guide — Business hub directory
  - ama.cafe / fond.coffee — Gastronomy guides
  - hq.tips — Tips/guides niche
  - curitiba.ama.cafe, dubai.fond.coffee — City-specific
- **Technology:** WordPress Multisite + MyListing theme + our plugin
- **Content:** Populated automatically via MediaGeek SaaS (Bright Data + Grok)
- **Monetization:**
  - Free listings (base)
  - Premium listings ($29-99/mo) → upgrade to "mini-site" listing
  - Tourism/gastronomy guides (digital products)
  - Amazon affiliate products embedded in listings
  - Google AdSense / display advertising
- **Blueprint:** `wp-plugins/directory-network/BLUEPRINT.md`

---

### ASSET 09 — App Frame (MOBILE WHITE LABEL) 🟢 PRIORITY 8
- **Status:** Concept only
- **What it is:** Single React Native (Capacitor) app that is a full-screen WebView
- **How it works:**
  - One codebase → infinite branded apps
  - Each client gets app.mediageek.io/client-name
  - App shows their subdomain in full screen
  - Changes to SaaS → app updates instantly (no App Store resubmission)
  - Client shares their app download link (Apple Store + Play Store)
- **Publishing pipeline:**
  - Fastlane automation on VPS
  - Client's logo + colors injected at build time
  - Automated submission to both stores
- **Revenue:** $199-499 setup + $49-99/mo maintenance
- **Blueprint:** `app-frame/BLUEPRINT.md`

---

## 🔧 Technical Infrastructure Map

### Servers & Services
```
REPLIT                    → Development only (code + test)
GitHub (MediaGeek org)    → All source code + BLUEPRINT.md files
VPS Hostinger             → N8N workflows + automation
VPS Hostgator WHM/cPanel  → WordPress Multisite (directories)
Cloudflare Pages          → Static HTML sites (TechSites, PixelForge)
Cloudflare Workers        → Edge functions, API routing
Google Drive              → Data accumulation (scraped leads, content)
```

### Core APIs & Keys Needed
| Service | Purpose | Priority |
|---------|---------|---------|
| **Grok (xAI)** | Replace Gemini — 10x cheaper for mass generation | URGENT |
| **Bright Data** | Lead scraping, directory population | URGENT |
| **Cloudflare API** | Auto-deploy static sites | Week 1 |
| **Google Drive API** | Data mirroring from scraping jobs | Week 1 |
| **GitHub API** | Auto-commit, CI/CD webhooks | Week 1 |
| **Amazon Affiliate** | Product injection in directories/listings | Week 2 |
| **Fastlane** | App Store automation | Month 2 |

### CI/CD Pipeline (Replit → GitHub → VPS)
```
1. Edit code in Replit
2. git push → GitHub main branch
3. GitHub Webhook fires → VPS receives ping
4. VPS runs: git pull && pnpm build && pm2 restart api
5. aisuite.mediageek.io updates in ~30 seconds automatically
```

---

## 📋 BLUEPRINT.md Standard Template

Every asset gets this file before shipping:

```markdown
# [ASSET NAME] — Blueprint Técnico e Comercial

## 1. Identidade do Ativo
- **Tipo:** (Cavalo de Troia / SaaS Direto / White Label / Plugin)
- **Canal de Venda:** (ThemeForest / Fiverr / MediaGeek Store / Direct)
- **Modelo de Receita:** (One-time / Recorrente / Híbrido)
- **Mecanismo de Captura:** (Como força cadastro no MediaGeek SaaS)

## 2. Stack Técnica
- Frontend: ...
- Backend: ...
- Banco de Dados: ...
- APIs Externas: ...
- Dependências: (versões exatas)

## 3. Instalação e Deploy
### Desenvolvimento (Replit)
```bash
# Comandos exatos
```
### Produção (VPS / Cloudflare)
```bash
# Comandos exatos
```

## 4. Fluxo do Usuário (Passo a Passo)
1. ...
2. ...

## 5. Integração com MediaGeek SaaS
- Endpoint: POST /api/...
- Auth: Bearer token
- Webhooks: ...

## 6. Dados e Backup
- O que é coletado: ...
- Destino GDrive: /MediaGeek/[ativo]/[nicho]/[data]
- Formato: JSON + CSV

## 7. Segurança
- Chaves de API: nunca no frontend, sempre no backend do SaaS
- Rate limiting: ...

## 8. Erros Comuns e Soluções
| Erro | Causa | Solução |
|------|-------|---------|
| ... | ... | ... |
```

---

## 🚀 Sprint Plan — First 30 Days

### Week 1 (Days 1-7) — Foundation
- [ ] Set up Grok API key in MediaGeek SaaS (replace Gemini)
- [ ] Set up Bright Data credentials
- [ ] Configure GitHub → VPS CI/CD webhook
- [ ] **Build:** Generic Business WordPress Theme + HTML Template
- [ ] **Build:** MediaGeek Connect WordPress Plugin (basic version)

### Week 2 (Days 8-14) — First Sales Channel
- [ ] Submit template to ThemeForest
- [ ] **Build:** TechProspect MVP (Bright Data + Grok + CSV export)
- [ ] Launch TechProspect on MediaGeek store
- [ ] Start scraping MyListing showcase sites for prospects

### Week 3 (Days 15-21) — Content & Traffic
- [ ] **Build:** TechSites MVP (Q&A → Cloudflare Pages deploy)
- [ ] **Build:** SEOContent basic (article generator + keyword multiplier)
- [ ] Fix PixelForge chatbot → connect to MediaGeek SaaS
- [ ] Launch cwb.site with 50 auto-generated listings

### Week 4 (Days 22-30) — Scale & Automate
- [ ] **Build:** MyListing Plugin (listings injection)
- [ ] Set up N8N workflows for WhatsApp outreach (TechProspect leads)
- [ ] Configure Google Drive auto-sync for scraped data
- [ ] Outreach campaign to MyListing site owners

---

## 💰 Revenue Projection (Conservative)

| Month | Products Active | Est. Revenue |
|-------|----------------|-------------|
| Month 1 | Template sales + TechProspect | $1,000-3,000 |
| Month 2 | + TechSites + PixelForge | $5,000-10,000 |
| Month 3 | + MyListing Plugin + Directories | $10,000-20,000 |
| Month 6 | Full ecosystem running | $30,000-80,000+ |

---

## 📁 Repository Structure

```
mediageek-os/
├── README.md                    ← This file
├── MEDIAGEEK-MASTER-PLAN.md     ← Full project map
├── core-saas/                   ← MediaGeek SaaS engine
│   ├── BLUEPRINT.md
│   ├── artifacts/api-server/
│   ├── artifacts/ai-suite-platform/
│   ├── techprospect/
│   └── seocontent/
├── wp-plugins/                  ← All WordPress plugins
│   ├── mediageek-connect/       ← Core WP plugin (Trojan Horse)
│   ├── mediageek-template/      ← WordPress theme
│   └── mylisting-connector/     ← MyListing automation plugin
├── cloudflare-workers/          ← Static sites and edge functions
│   ├── techsites/
│   └── pixelforge/
├── app-frame/                   ← iOS + Android WebView app
├── scrapers-engines/            ← Bright Data integrations
│   └── gdrive-sync/             ← Auto-mirror scraped data to GDrive
└── n8n-workflows/               ← Automation workflows (already have 13)
```

---

*This document is the law. Every asset built must have a BLUEPRINT.md before shipping.*
*Updated automatically by Replit whenever a new asset is created or modified.*
