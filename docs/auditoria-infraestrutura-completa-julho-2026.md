# Auditoria de Infraestrutura Completa
**Data:** Julho de 2026  
**Escopo:** 3 VPS + N8N + WHM/cPanel + Secrets

---

## Mapa Geral da Infraestrutura

```
┌─────────────────────────────────────────────────────────────┐
│  VPS 1 — Hostinger Node.js (179.197.229.207)                │
│  MediaGeek SaaS + futuros SaaS                              │
│  PM2: mediageek (porta 3000) + deploy-webhook               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  VPS 2 — Hostinger N8N (187.77.37.75)                       │
│  50 workflows ativos — PixelForge, TechSites, SEOContent,   │
│  Outreach W-series                                          │
│  SSH root bloqueado → acesso via API N8N ✅                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  VPS 3 — Hostgator WHM/cPanel (redewp.com)                  │
│  4 contas cPanel: directories, WordPress, clientes          │
│  SSH bloqueado → acesso via WHM API ✅                       │
└─────────────────────────────────────────────────────────────┘
```

---

## VPS 1 — Hostinger Node.js

| Item | Valor |
|---|---|
| IP | 179.197.229.207 |
| Acesso SSH | ✅ Chave em `.agents/deploy_key` |
| Processo 0 | `mediageek` — Next.js porta 3000 — online 35h |
| Processo 1 | `deploy-webhook` — GitHub Actions trigger — online 46h |
| Deploy | GitHub push → webhook → git pull + build + pm2 restart |
| App dir | `/var/www/mediageek/artifacts/ai-suite/` |

**Status:** Estável. MediaGeek em produção, zero clientes.

---

## VPS 2 — Hostinger N8N

| Item | Valor |
|---|---|
| IP | 187.77.37.75 |
| SSH root | ❌ Bloqueado (login negado) |
| N8N API | ✅ Funcionando com `N8N_API_KEY` |
| N8N URL | Configurado em `N8N_BASE_URL` |
| Total workflows | 50 |
| Workflows ativos | 24 ON |
| Workflows inativos | 26 off |
| Credenciais via API | 0 visíveis (permissão de API insuficiente) |

### Sistemas no N8N

#### 🔶 PixelForge (9 workflows — 8 ativos)
Sistema próprio de SaaS com Fiverr. **Já está em produção.**

| Status | Workflow |
|---|---|
| ON | `pf-agent-bootstrap` |
| ON | `pf-agent-interest` |
| ON | `pf-credits-purchase` |
| ON | `pf-fiverr-inbox` |
| ON | `pf-magic-link-reissue` |
| ON | `pf-revision-handler` |
| ON | `PixelForge — Fiverr Onboarding Bridge` |
| ON | `PixelForge — Hub Upsell (Cross-sell Gigs)` |
| ON | `PixelForge — 90-day Expiry Renewal Reminder` |

#### 🔵 TechSites / WaaS (10 workflows — 5 ativos)

| Status | Workflow |
|---|---|
| ON | `ts-agent-bootstrap` |
| ON | `ts-briefing-intake` |
| ON | `ts-chat-editor-intake` |
| ON | `TechSites WaaS — Template Builder V4` |
| ON | `TechSites — Save Template (WYSIWYG Editor)` |
| ON | `Action Center — Perplexity Pending Bridge (Safe)` |
| ON | `Action Center — Site Trigger Bridge (Safe)` |
| off | `TechSites — Perplexity-N8N Bridge` |
| off | `Maestro — Fábrica de Sites TechSites` |
| off | `WaaS - Payment Handler` |
| off | `WaaS 01 - Curitiba Listings Builder v1` |
| off | `WaaS - Lead Capture - v1` |

#### 🟢 W-Series — Outreach B2B (8 workflows — 7 ativos)
Pipeline completo de prospecção: Google Maps → Email → WhatsApp.

| Status | Workflow |
|---|---|
| ON | `W1 — Google Maps Scraper` |
| ON | `W2 — Email Enrichment` |
| ON | `W3 — Cold Email Outreach` |
| ON | `W4 — Email Follow-up Sequence` |
| ON | `W6 — WhatsApp Outreach Funnel` |
| ON | `W7 — WhatsApp Follow-up Sequence` |
| ON | `W8 — Instagram Scraper` |
| off | `W3 — Cold Email Outreach` (versão antiga) |

#### 🟡 SEOContent Engine (17 workflows — 1 ativo)
Motor de geração de conteúdo SEO. Múltiplas versões em desenvolvimento.

| Status | Workflow |
|---|---|
| ON | `SEOContent - SEO Audit V1.0` |
| off | `SEOContent - AI Engine V4.0 (Unified)` ← versão mais nova |
| off | `SEOContent-AI-Engine-V3.2` |
| off | `SEOContent-AI-Engine-V3.1` |
| off | `SEOContent-AI-Engine-V2.9` |
| off | `SEOContent-AI-Engine-V2.7` |
| off | `SEOContent-AI-Engine-V2.6` |
| off | `SEOContent-AI-Engine-V2.5` |
| off | `SEOContent-AI-Engine-V2.3` |
| off | `SEOContent-AI-Engine-V2.2` |
| off | `SEOContent - AI Engine V2.1` |
| off | `SEOContent - AI Engine V2` |
| off | `SEOContent — Artigo Mínimo` |
| off | `SEOContent - Multi-Site Engine` |
| off | `SEOContent - 1-Click Post` |
| off | `SEOContent - Bulk Generation` |
| off | `SEOContent - Ayahuasca HQ` |

#### ⚫ Testes / Misc (6 workflows — todos off)
`My workflow`, `Webhook Test Simple`, `Test Webhook Registration`, `tduidrtuidd`, etc.

---

## VPS 3 — Hostgator WHM/cPanel

| Item | Valor |
|---|---|
| Host | redewp.com |
| IP Compartilhado | 129.121.34.139 |
| WHM API | ✅ Funcionando com token |
| SSH porta 22 | ❌ Bloqueado |
| Total contas cPanel | 4 |

### Contas cPanel

| Usuário | Domínio | Disco | IP | Desde |
|---|---|---|---|---|
| `redewp` | redewp.com | 468M | 129.121.34.139 | Dez/2025 |
| `pousada` | pousadasaopedrotimbo.com.br | 1017M | 129.121.34.139 | Dez/2025 |
| `netmediageek` | net.mediageek.io | 297M | 129.121.33.184 | Jul/2026 |
| `driverscopilot` | driverscopilot.app | 408M | 129.121.34.139 | Jul/2026 |

**Observações:**
- `redewp.com` — provavelmente a rede WordPress base (BeTheme, MyListing, directories)
- `pousada` — cliente ativo (1GB de disco = site com conteúdo)
- `netmediageek` — IP diferente (129.121.33.184) e plano `amacafe-ip` — possivelmente isolado
- `driverscopilot.app` — projeto novo (criado Jul/2026)

---

## Mapa de Secrets — Status Final

| Secret | Status | Uso |
|---|---|---|
| `GEMINI` | ✅ | MediaGeek — geração de conteúdo |
| `GROK` | ✅ | MediaGeek — fallback AI |
| `STRIPE_SECRET_KEY` | ✅ | MediaGeek — pagamentos |
| `STRIPE_WEBHOOK_SECRET` | ✅ | MediaGeek — webhooks |
| `SESSION_SECRET` | ✅ | MediaGeek — sessões |
| `GITHUB_TOKEN` | ✅ | Deploy MediaGeek |
| `GITHUB_TOKEN_TECHSITES` | ✅ | Deploy TechSites repos |
| `VPS_ROOT_PASSWORD` | ✅ | VPS 1 Node.js SSH |
| `CLOUDFLARE_ACCOUNT_ID` | ✅ | Cloudflare conta TechSites |
| `CLOUDFLARE_API_TOKEN` | ✅ | Cloudflare API TechSites |
| `CLOUDFLARE_MEDIAGEEK_ACCOUNT_ID` | ✅ | Cloudflare conta MediaGeek |
| `CLOUDFLARE_MEDIAGEEK_API_TOKEN` | ✅ | Cloudflare API MediaGeek (recriar com Pages permission) |
| `BRIGHTDATA` | ✅ | Scraping de listings |
| `GDRIVE_TECHSITES_CREDENTIALS` | ✅ (legacy) | Substituído pelo Replit Connector |
| `MERCADO_PAGO_ACCESS_TOKEN` | ✅ (descontinuar) | MediaGeek — remover na reconstrução |
| `N8N_VPS_HOST` | ✅ | IP VPS N8N |
| `N8N_VPS_ROOT_PASSWORD` | ✅ | SSH VPS N8N (root bloqueado — usar API) |
| `N8N_BASE_URL` | ✅ | URL base do N8N |
| `N8N_API_KEY` | ✅ | N8N REST API |
| `HOSTGATOR_VPS_HOST` | ✅ | redewp.com |
| `HOSTGATOR_ROOT_PASSWORD` | ✅ | WHM/SSH (SSH bloqueado — usar WHM API) |
| `HOSTGATOR_WHM_API_TOKEN` | ✅ | WHM REST API ✅ funcionando |

**Pendente:**
- `CLOUDFLARE_MEDIAGEEK_API_TOKEN` — recriar com permissão `Cloudflare Pages: Edit`
- Conector Cloudflare no Replit — ativar em Settings → Connectors (após WHM não necessário para Hostgator)

---

## Projetos Identificados (além do MediaGeek)

| Projeto | Status | Onde vive |
|---|---|---|
| **MediaGeek** | Em produção, zero clientes | VPS 1 (Node.js) |
| **PixelForge** | Em produção com Fiverr (!) | N8N (9 workflows ativos) |
| **TechSites/SYNEX** | Parcialmente ativo | N8N (5 workflows) + GitHub |
| **SEOContent Engine** | Em desenvolvimento (V4.0 parado) | N8N (1 ativo) |
| **W-Series Outreach** | Ativo | N8N (7 workflows) |
| **redewp.com** | Em produção | Hostgator cPanel |
| **driverscopilot.app** | Novo (Jul/2026) | Hostgator cPanel |
| **net.mediageek.io** | Novo (Jul/2026) | Hostgator cPanel |
| **pousadasaopedrotimbo.com.br** | Cliente ativo | Hostgator cPanel |

---

## Descoberta Importante: PixelForge

O N8N tem 9 workflows ativos de um sistema chamado **PixelForge** com integração Fiverr — sistema de créditos, onboarding, magic links, hub upsell e renovação de 90 dias. **Está em produção.** É um SaaS/produto separado não mencionado até agora. Precisará de contexto do usuário para entender o escopo e onde está hospedado o frontend.

---

*Auditoria gerada via SSH (VPS 1), N8N REST API, e WHM REST API — Julho 2026.*
