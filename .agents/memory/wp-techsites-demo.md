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
- BeTheme: criar WordPress em `be.net.techsites.ai` via cPanel (129.121.33.184)
  - Wildcard `*.net.techsites.ai` já aponta para o cPanel, só criar subsite
- MyListing: `cwb.net.techsites.ai` já pronto

### Blocker crítico HOJE
Redeploy do Replit é necessário para `wp.techsites.ai` funcionar end-to-end:
- Dev (localhost:8080): tudo funciona ✅
- Produção (gemini-suite.replit.app): deploy de 1/8 não tem rotas /wp/*
- Fix: usuário clica "Deploy" no Replit → Cloudflare Worker pega novo código

**Why:** api-server produção usa dist compilado na época do deploy; novo código só vai para produção após redeploy

**How to apply:** Sempre que adicionar rotas novas ao api-server, lembrar que wp.techsites.ai só vai receber essas rotas após um novo deploy em produção.
