---
name: APEX Core DNS & deployment architecture
description: DNS apex.techsites.ai apontava para CF Pages, não VPS — raiz de todos os erros de API
---

# APEX Core — DNS e arquitetura de deploy

## Regra
Sempre verificar o DNS record antes de depurar API ou SSL.
`apex.techsites.ai` deve ser um A record para `179.197.229.207` (não CNAME para Pages).

**Why:** O DNS estava como CNAME para `apex-meeting.pages.dev` (Cloudflare Pages).
O frontend estava no CF Pages mas sem backend — chamadas para `/api/*` retornavam 405.
A VPS tinha nginx + express configurados corretamente mas nunca recebia o tráfego.

## Estado atual (corrigido)
- DNS: A record → 179.197.229.207, CF proxy ON
- SSL: Let's Encrypt `/etc/letsencrypt/live/apex.techsites.ai/` (expira 2026-10-28, auto-renew)
- CF SSL mode: "full" (cert válido no origin)
- nginx: `/etc/nginx/sites-enabled/apex-techsites` — serve static files + proxy /api/ → 8080

## PM2 processo apex-api (CRÍTICO)
PM2 foi recriado com env vars injetadas via shell (não lê .env.local automaticamente).
Se a VPS reiniciar, o processo vai subir sem DATABASE_URL correto (conecta a "helium").
**Fix pendente:** criar ecosystem file PM2 com env vars explícitas (task #54).

## Como aplicar
Antes de depurar qualquer erro de API no APEX Core:
1. `dig apex.techsites.ai` — confirmar que aponta para 179.197.229.207
2. `pm2 status` — confirmar apex-api online e com uptime razoável
3. `curl http://localhost:8080/api/healthz` — confirmar API responde
