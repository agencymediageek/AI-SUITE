---
name: APEX CORE MEETING Deployment
description: Infraestrutura de produção do APEX CORE MEETING em apex.techsites.ai
---

## URLs de Produção
- Frontend: https://apex.techsites.ai (Cloudflare proxied → VPS 179.197.229.207)
- API: https://apex.techsites.ai/api/* (nginx proxy → VPS:8080)

## VPS Setup
- PM2 process: `apex-api` (id=2) — `/var/www/mediageek/artifacts/api-server/dist/index.mjs`
- Ecosystem file: `/var/www/mediageek/artifacts/api-server/ecosystem.config.cjs`
- Env file: `/var/www/mediageek/artifacts/api-server/.env.local` (DATABASE_URL, GROK, SESSION_SECRET, STRIPE_*)
- Static files: `/var/www/mediageek/artifacts/apex-meeting/dist/public/`
- nginx config: `/etc/nginx/sites-available/apex-techsites` (linked in sites-enabled)
- SSL: self-signed cert at `/etc/nginx/ssl/apex-techsites.{crt,key}` (Cloudflare "full" mode accepts)

## Deploy Automático
- GitHub push → GitHub Actions → deploy webhook POST 9876 → `server.js` em `/var/www/deploy-webhook/`
- O webhook agora inclui: build api-server → pm2 restart apex-api + build apex-meeting frontend
- Build command do frontend: `PORT=3001 BASE_PATH=/ pnpm --filter @workspace/apex-meeting run build`

## Cloudflare DNS
- Zone: techsites.ai (ID: aaa2418ffbb69192aa3546436397ccac)
- Record: A apex → 179.197.229.207 (proxied=true)
- SSL mode: "full" (aceita self-signed no origin)

## Why self-signed cert (não Let's Encrypt)
- Cloudflare proxy modo "full" aceita self-signed sem problemas
- Let's Encrypt HTTP-01 challenge com CF proxy ativado é complicado
- Alternativa futura: Cloudflare Origin Certificate via API (requer CSR gerado no VPS)

## Atualizar o site após mudanças
```bash
# No VPS manualmente:
cd /var/www/mediageek && git pull origin main
pnpm --filter @workspace/api-server run build && pm2 restart apex-api
PORT=3001 BASE_PATH=/ pnpm --filter @workspace/apex-meeting run build
```
Ou fazer push para GitHub → auto-deploy via webhook.
