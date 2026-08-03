---
name: WP TechSites investor demo
description: Estado completo do ecosystem wp.techsites.ai — endpoints, plugin, domínios, diretório CWB
---

## Estado — 2026-08-03 (sprint pré-demo)

### Domínios configurados
- `wp.techsites.ai` → Cloudflare Worker `wp-techsites-proxy` → `gemini-suite.replit.app/api/*`
  - DNS: CNAME wp → gemini-suite.replit.app (proxied, Full SSL)
  - Worker route: wp.techsites.ai/* → wp-techsites-proxy
  - **CRÍTICO**: Produção em gemini-suite.replit.app precisa ser REDEPLOYADA para as rotas /wp/* funcionarem
- `cwb.site` → Page Rule 301 → `cwb.net.techsites.ai` (CF account MEDIAGEEK) ✅
- `cwb.net.techsites.ai` → WordPress Multisite com MyListing, 30 listings importados

### Plugin v2.2.0
- `WPTS_API_BASE = 'https://wp.techsites.ai/api/wp'`
- ZIP: `artifacts/wp-techsites-plugin/wp-techsites-plugin-v2.2.0.zip` (40944 bytes)
- Download URL após redeploy: `https://wp.techsites.ai/api/plugins/wp-techsites-plugin-v2.2.0.zip`
- Novas funcionalidades v2.2.0:
  - Auto-onboarding ao salvar API key (SEO audit + theme detection automático)
  - Aba "Popular Diretório" (batch import múltiplas categorias)
  - Aba "Página de Empresa" (URL → WP page com IA)
  - Aba "Artigo com Imagens" (SEO article + Unsplash photos)

### Endpoints api-server /api/wp/*
Todos funcionam em dev (localhost:8080). Em produção após redeploy:
- GET  /verify, /dashboard, /listings — básicos
- POST /register, /connect-rest — onboarding
- POST /onboarding — auto-SEO audit + theme detection (v2.2.0)
- POST /chat, /chat-editor — chatbot + editor IA
- POST /scraping/run, /scraping/status — BrightData
- POST /demo — demo completo 5 listings em ~25s
- POST /populate-directory — batch import N categorias (NEW v2.2.0)
- POST /page-from-url — URL → WP page (NEW v2.2.0)
- POST /article-with-images — artigo SEO + Unsplash images (NEW v2.2.0)
- GET  /plugins/wp-techsites-plugin-v2.2.0.zip — download estático (NEW)

### cwb.net.techsites.ai
- Site registrado: id=1, api_key=1238b9d0-8753-4b7a-9f66-26a016a0e1a0
- wp_rest_url=https://cwb.net.techsites.ai/wp-json, user=admin_6k23im5i
- Créditos: ~4760 (started at 5000)
- 30 listings importados (6 categorias × 5): restaurantes, hotéis, turismo, serviços, saúde, compras
- Artigo publicado: "Melhores Restaurantes do Batel" com imagem Unsplash
- Página criada: "Boa Chancha - Carnes e Produtos Selecionados"

### Sites de teste para a equipe
- BeTheme: `be.net.techsites.ai` → criado, design premium ✅
- MyListing: `cwb.site` (era cwb.net.techsites.ai, domínio principal agora é cwb.site)
  - cwb.site IP: 129.121.33.184 (orange cloud), SSL Full ✅
  - cwb.site REST API: wp_rest_url atualizado para https://cwb.site/wp-json ✅
  - cwb.site wp-admin: acessível ✅

### cwb.site config Cloudflare
- Zone: 2bca145bf1e1def474280eb0604e9058 (MEDIAGEEK account)
- DNS: A cwb.site → 129.121.33.184 (proxied), CNAME www → cwb.site (proxied)
- SSL: Full (não Strict — aceita cert hostname do cPanel)
- Page rules: NENHUM (redirect rules deletados, causavam SSL DCV failure)
- Always Use HTTPS: on

### Plugin download
- GitHub raw (público, imediato): https://raw.githubusercontent.com/agencymediageek/AI-SUITE/main/releases/wp-techsites-plugin-v2.2.0.zip
- Após deploy Replit: https://wp.techsites.ai/api/plugins/wp-techsites-plugin-v2.2.0.zip

### Sites WP Multisite (net.techsites.ai, user: nettechsites)
- blog_id 1: net.techsites.ai (main)
- blog_id 4: cwb1.net.techsites.ai
- blog_id 5: cwb.site (primary domain for cwb directory)
- blog_id 6: be.net.techsites.ai (BeTheme)
- blog_id 7: teste.net.techsites.ai (demo sandbox) → api_key: 944dcdd0-3808-4313-977f-7b2964267a1c

### techsites.ai DNS
- A techsites.ai → 129.121.33.184 (proxied) — agora aponta para cPanel, antes era CNAME para Pages
- A www.techsites.ai → 129.121.33.184 (proxied)
- *.net.techsites.ai → 129.121.33.184 (proxied)
- SSL zone techsites.ai: Full + Always HTTPS

### wp.techsites.ai SaaS MVP
- Painel usuário: /wp-techsites/ (registro, dashboard, 3 ferramentas IA originais + 3 novas Directory)
- Painel admin: /wp-techsites/admin (token: techsites-admin-2026, sem auth externa)
- Admin endpoint: GET/PATCH /api/wp/admin/sites (X-Admin-Token header)
- Novas ferramentas: /tools/populate, /tools/page-from-url, /tools/article
- lib/api-headers.ts: getApiBaseUrl() returns '/api/' para fetch direto

### Blocker crítico HOJE
Redeploy do Replit é necessário para `wp.techsites.ai` funcionar end-to-end:
- Dev (localhost:8080): tudo funciona ✅
- Produção (gemini-suite.replit.app): deploy de 1/8 não tem rotas /wp/*
- Fix: usuário clica "Deploy" no Replit → Cloudflare Worker pega novo código

**Why:** api-server produção usa dist compilado na época do deploy; novo código só vai para produção após redeploy

**How to apply:** Sempre que adicionar rotas novas ao api-server, lembrar que wp.techsites.ai só vai receber essas rotas após um novo deploy em produção.
