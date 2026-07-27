---
name: Estado da Plataforma
description: Mapa completo de infraestrutura, projetos, secrets e pendências — atualizado após auditoria completa Jul/2026
---

## Infraestrutura — 3 VPS

### VPS 1 — Hostinger Node.js (179.197.229.207)
- SSH: chave em `.agents/deploy_key` ✅
- PM2: `mediageek` (porta 3000) + `deploy-webhook`
- App: `/var/www/mediageek/artifacts/ai-suite/`
- Deploy: GitHub push → webhook → git pull + build + pm2 restart

### VPS 2 — Hostinger N8N (187.77.37.75)
- SSH root: bloqueado → usar N8N REST API
- Acesso: `N8N_BASE_URL` + `N8N_API_KEY` ✅
- 50 workflows (24 ON, 26 off)
- Sistemas: PixelForge (8 ON), TechSites (5 ON), W-Series outreach (7 ON), SEOContent (1 ON)

### VPS 3 — Hostgator WHM/cPanel (redewp.com / 129.121.34.139)
- SSH porta 22: bloqueado → usar WHM API
- WHM API: `HOSTGATOR_WHM_API_TOKEN` ✅ funcionando
- 4 contas cPanel: redewp, pousada, netmediageek, driverscopilot

---

## Projetos

### MediaGeek AI (mediageek.io)
- Estado: funcional, zero clientes, não lançado
- Decisões: reconstruir — inglês only, Stripe only
- Bugs mobile: todos corrigidos (Jul/2026)
- Tasks pendentes: #3 auto-deploy, #4 favorites bug, #5 admin account

### PixelForge
- Estado: EM PRODUÇÃO com Fiverr (9 workflows N8N ativos)
- Contexto: SaaS com sistema de créditos, magic links, onboarding Fiverr, hub upsell
- Frontend: localização desconhecida — verificar com usuário
- Workflows: pf-agent-bootstrap, pf-credits-purchase, pf-fiverr-inbox, pf-magic-link-reissue, pf-revision-handler, pf-agent-interest, PixelForge Fiverr Onboarding Bridge, Hub Upsell, 90-day Expiry Renewal

### TechSites / SYNEX
- Estado: 5 N8N workflows ativos, directory engine não implementado em código
- N8N ativos: ts-agent-bootstrap, ts-briefing-intake, ts-chat-editor-intake, WaaS Template Builder V4, Save Template WYSIWYG
- N8N inativos: Maestro Fábrica de Sites (off!), Perplexity-N8N Bridge, WaaS Payment Handler
- GitHub: 16 repos (dubai-coffee-rebuild, techsites-templates como ativos principais)
- Cloudflare: 14 domínios, só techsites.ai live
- Drive: blueprints SYNEX completos (connector ativo)
- Próximo: construir engine/build.js (Node.js static site generator)

### SEOContent Engine
- Estado: V4.0 (Unified) parado, V1.0 SEO Audit ativo
- Múltiplas versões: V2→V4, todas off exceto audit

### W-Series Outreach (B2B prospecting)
- Estado: pipeline completo ATIVO
- W1 Google Maps Scraper → W2 Email Enrichment → W3 Cold Email → W4 Follow-up → W6 WhatsApp Funnel → W7 WhatsApp Follow-up → W8 Instagram Scraper

### Hostgator Sites
- redewp.com — rede WordPress (BeTheme/MyListing)
- driverscopilot.app — projeto novo Jul/2026
- net.mediageek.io — MediaGeek relacionado, Jul/2026
- pousadasaopedrotimbo.com.br — cliente ativo (1GB)

---

## Secrets — Estado Completo

Todos configurados: GEMINI, GROK, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, SESSION_SECRET, GITHUB_TOKEN, GITHUB_TOKEN_TECHSITES, VPS_ROOT_PASSWORD, CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN, CLOUDFLARE_MEDIAGEEK_ACCOUNT_ID, CLOUDFLARE_MEDIAGEEK_API_TOKEN, BRIGHTDATA, GDRIVE_TECHSITES_CREDENTIALS (legacy), MERCADO_PAGO_ACCESS_TOKEN (descontinuar), N8N_VPS_HOST, N8N_VPS_ROOT_PASSWORD, N8N_BASE_URL, N8N_API_KEY, HOSTGATOR_VPS_HOST, HOSTGATOR_ROOT_PASSWORD, HOSTGATOR_WHM_API_TOKEN

**Pendências de secrets/acesso:**
- CLOUDFLARE_MEDIAGEEK_API_TOKEN: recriar com permissão Pages:Edit
- Conector Cloudflare Replit: ativar em Settings → Connectors
- PixelForge: verificar onde está o frontend e se precisa de secrets

---

## Auditórias Salvas
- `docs/auditoria-techsites-julho-2026.md`
- `docs/auditoria-gdrive-julho-2026.md`
- `docs/auditoria-infraestrutura-completa-julho-2026.md`
