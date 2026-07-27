# Auditoria de Infraestrutura Completa
**Data:** Julho de 2026  
**Status:** ✅ Acesso confirmado a todas as infraestruturas críticas

---

## 3 VPS

| VPS | Host | IP | Acesso | Uso |
|---|---|---|---|---|
| Node.js | Hostinger | 179.197.229.207 | SSH key ✅ | MediaGeek SaaS + futuros SaaS |
| N8N | Hostinger | 187.77.37.75 | N8N API ✅ | 50 workflows — automações TechSites, PixelForge, Outreach |
| WHM/cPanel | Hostgator | redewp.com | WHM API ✅ | Directories, WordPress, clientes |

---

## Cloudflare TechSites — Acesso Total ✅

**14 zonas DNS · 10 Cloudflare Pages · 17 Workers**

### Pages Projects (todos deployados Mai/2026)

| Projeto | URL | Domínio Custom | Repo |
|---|---|---|---|
| `directory-template-master` | pages.dev | **dubai.fond.coffee** ✅ | sem repo |
| `global-fond-coffee` | pages.dev | **global.fond.coffee** ✅ | sem repo |
| `gym-techsites-01` | pages.dev | — | gym-techsites [main] |
| `template-master-onepage` | pages.dev | — | template-master-onepage [main] |
| `ts-saas-tech` | pages.dev | — | sem repo |
| `ts-marketing-agency` | pages.dev | — | sem repo |
| `ts-portfolio-freelancer` | pages.dev | — | sem repo |
| `ts-ecom-single-product` | pages.dev | — | sem repo |
| `ts-fitness-wellness` | pages.dev | — | sem repo |
| `ts-dentist-medical` | pages.dev | — | sem repo |

**Observação crítica:** 8 dos 10 projetos foram deployados **sem repositório GitHub** (upload direto). Isso significa zero CI/CD — qualquer atualização exige upload manual. Conectar repos é prioridade quando o engine estiver pronto.

### Workers (17 scripts — Apr/Mai 2026)

| Worker | Categoria | Última modificação |
|---|---|---|
| `techsites-hub-production` | Hub TechSites | Mai/2026 |
| `techsites-hub` | Hub TechSites (dev) | Mai/2026 |
| `techsites-editor-api-production` | WYSIWYG Editor | Abr/2026 |
| `techsites-editor-api` | WYSIWYG Editor (dev) | Abr/2026 |
| `techsites-proxy-production` | Proxy | Abr/2026 |
| `techsites-wysiwyg-sandbox-api` | WYSIWYG Sandbox | Abr/2026 |
| `techsites-dxb-wildcard-router` | Dubai wildcard router | Abr/2026 |
| `pixelforge-hub-production` | PixelForge Hub | Mai/2026 |
| `pixelforge-hub` | PixelForge Hub (dev) | Mai/2026 |
| `pixelforge-hub-dev` | PixelForge Hub (dev2) | Mai/2026 |
| `agency-wysiwyg-standalone-review-api` | WYSIWYG cliente | Abr/2026 |
| `dentist-wysiwyg-standalone-review-api` | WYSIWYG cliente | Abr/2026 |
| `mokha-wysiwyg-standalone-api` | WYSIWYG cliente (Mokha café) | Abr/2026 |
| `real-estate-model-wysiwyg-api` | WYSIWYG cliente | Mai/2026 |
| `techprospect-wysiwyg-review-api` | WYSIWYG cliente | Abr/2026 |
| `trial-model-dubai-wysiwyg-api` | WYSIWYG trial Dubai | Abr/2026 |
| `tsw-lawyer-accountant` | Template lawyer | Mai/2026 |

**Descoberta crítica:** O WYSIWYG editor está em **produção real** servindo múltiplos clientes via Workers (agency, dentist, mokha, real-estate, techprospect). O produto já existe — só não tem esteira automatizada de deploy.

---

## Cloudflare MediaGeek — Acesso Parcial ⚠️

| Permissão | Status |
|---|---|
| DNS Read/Edit | ✅ (16 registros) |
| Cloudflare Pages | ❌ token sem Account scope |
| Workers | ❌ token sem Account scope |
| Cache Purge | ❌ token sem Account scope |

**Impacto:** Nenhum. MediaGeek roda no VPS Hostinger (179.197.229.207), não em Pages. Pages/Workers para MediaGeek são necessários apenas no futuro se movermos o frontend para edge. DNS para gerenciar mediageek.io funciona perfeitamente.

**DNS mediageek.io mapeado:**
```
mediageek.io / www      → 179.197.229.207  (VPS Node.js)
aisuite.mediageek.io    → 34.111.179.208   (Google Cloud — verificar)
api.mediageek.io        → 129.121.33.184   (Hostgator)
net.mediageek.io        → 129.121.33.184   (Hostgator — conta cPanel nova)
saas.mediageek.io       → 129.121.33.184   (Hostgator)
*.mediageek.io          → 129.121.33.184   (Hostgator wildcard)
mail.mediageek.io       → 129.121.33.184   (Hostgator)
send.saas.mediageek.io  → Amazon SES
```

---

## N8N (50 workflows)

### PixelForge — Em Produção ✅ (9 workflows ON)
SaaS com Fiverr: créditos, magic links, onboarding, hub upsell, renovação 90 dias.  
`pf-agent-bootstrap` · `pf-agent-interest` · `pf-credits-purchase` · `pf-fiverr-inbox` · `pf-magic-link-reissue` · `pf-revision-handler` · `PixelForge Fiverr Onboarding Bridge` · `PixelForge Hub Upsell` · `PixelForge 90-day Renewal`

### TechSites/WaaS — Parcialmente Ativo (5 ON / 7 OFF)
ON: `ts-agent-bootstrap` · `ts-briefing-intake` · `ts-chat-editor-intake` · `TechSites WaaS Template Builder V4` · `TechSites Save Template WYSIWYG`  
OFF: `Maestro Fábrica de Sites` · `Perplexity-N8N Bridge` · `WaaS Payment Handler` · `WaaS Curitiba Listings Builder` · `WaaS Lead Capture`

### W-Series Outreach B2B — Ativo ✅ (7 ON)
Pipeline: `W1 Google Maps Scraper` → `W2 Email Enrichment` → `W3 Cold Email` → `W4 Follow-up` → `W6 WhatsApp Funnel` → `W7 WhatsApp Follow-up` + `W8 Instagram Scraper`

### SEOContent Engine — Em Desenvolvimento (1 ON / 16 OFF)
17 versões (V2→V4). Apenas `SEO Audit V1.0` ativo. `V4.0 Unified` é a versão mais recente, parada.

---

## Hostgator WHM — 4 contas cPanel ✅

| Conta | Domínio | Disco | Desde |
|---|---|---|---|
| `redewp` | redewp.com | 468M | Dez/2025 |
| `pousada` | pousadasaopedrotimbo.com.br | 1017M | Dez/2025 |
| `netmediageek` | net.mediageek.io | 297M | Jul/2026 |
| `driverscopilot` | driverscopilot.app | 408M | Jul/2026 |

---

## Secrets — Mapa Final

| Secret | ✅/⚠️ | Serve para |
|---|---|---|
| `GEMINI` | ✅ | MediaGeek AI |
| `GROK` | ✅ | MediaGeek AI |
| `STRIPE_SECRET_KEY` | ✅ | MediaGeek pagamentos |
| `STRIPE_WEBHOOK_SECRET` | ✅ | MediaGeek webhooks |
| `SESSION_SECRET` | ✅ | MediaGeek sessões |
| `GITHUB_TOKEN` | ✅ | Deploy MediaGeek |
| `GITHUB_TOKEN_TECHSITES` | ✅ | Deploy TechSites repos |
| `VPS_ROOT_PASSWORD` | ✅ | VPS Node.js SSH |
| `CLOUDFLARE_ACCOUNT_ID` | ✅ | TechSites CF account |
| `CLOUDFLARE_API_TOKEN` | ✅ | TechSites CF — Pages + Workers + DNS |
| `CLOUDFLARE_MEDIAGEEK_ACCOUNT_ID` | ✅ | MediaGeek CF account |
| `CLOUDFLARE_MEDIAGEEK_API_TOKEN` | ⚠️ | MediaGeek CF — só DNS (sem Pages/Workers) |
| `BRIGHTDATA` | ✅ | Scraping listings |
| `MERCADO_PAGO_ACCESS_TOKEN` | ✅ (remover) | MediaGeek — descontinuar |
| `N8N_VPS_HOST` | ✅ | IP VPS N8N |
| `N8N_VPS_ROOT_PASSWORD` | ✅ | SSH N8N (root bloqueado, usar API) |
| `N8N_BASE_URL` | ✅ | URL base N8N |
| `N8N_API_KEY` | ✅ | N8N REST API |
| `HOSTGATOR_VPS_HOST` | ✅ | redewp.com |
| `HOSTGATOR_ROOT_PASSWORD` | ✅ | WHM/SSH |
| `HOSTGATOR_WHM_API_TOKEN` | ✅ | WHM REST API |
| Google Drive Connector | ✅ | Drive API via Replit connector |

---

## Esteira de Projetos — Ordem Sugerida

### 1. MediaGeek (reconstrução) — base limpa
- Inglês only, Stripe only, remover Mercado Pago
- Simplificar código, reforçar segurança
- Tasks pendentes: #3 auto-deploy, #4 favorites bug, #5 admin account

### 2. TechSites Engine (build.js)
- Extrair partials do Dubai Coffee (nav, footer, card)
- Build script Node.js: config.json → site estático completo
- Conectar 8 Pages projects a repos GitHub (CI/CD)
- Primeira replicação automática: curitiba.ama.cafe ou second fond.coffee city

### 3. SEOContent V4.0
- Ativar e testar o engine unificado
- Integrar com o build.js (conteúdo gerado → site gerado)

### 4. PixelForge
- Mapear frontend (Workers já ativos, localização do UI desconhecida)
- Documentar e estabilizar

*Auditoria gerada via SSH, N8N REST API, WHM REST API, Cloudflare API — Julho 2026.*
