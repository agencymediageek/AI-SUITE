# 📋 WP TechSites — Documentação Técnica
> **Para o plantonista.** Última atualização: 2026-08-01.  
> Status MVP: pronto para demo. Produto em produção: wp.techsites.ai

---

## 1. Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    Cliente (Browser)                        │
└─────────────┬───────────────────────────────────────────────┘
              │
    ┌─────────▼─────────┐        ┌─────────────────────────┐
    │  Dashboard SaaS   │        │  WordPress Site do       │
    │  wp.techsites.ai  │        │  Cliente (qualquer host) │
    │  (React/Vite)     │        │  + Plugin WP TechSites   │
    └─────────┬─────────┘        └──────────┬──────────────┘
              │ REST                         │ X-WP-Site-Key
              ▼                              ▼
    ┌─────────────────────────────────────────────────────────┐
    │              API Server (Express + TypeScript)          │
    │              VPS: 179.197.229.207:8080                  │
    │              Rota base: /api/wp/*                       │
    └────────────────────────┬────────────────────────────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
        ┌──────────┐  ┌──────────┐  ┌──────────────┐
        │ PostgreSQL│  │  Grok IA │  │  BrightData  │
        │  DB: apex │  │ (xAI)   │  │  (scraping)  │
        └──────────┘  └──────────┘  └──────────────┘
                                          │
                                   ┌──────▼──────┐
                                   │  N8N VPS    │
                                   │  Workflows  │
                                   └─────────────┘
```

---

## 2. Plugin WordPress

### Arquivo principal
`artifacts/wp-techsites-plugin/wp-techsites.php`  
**ZIP instalável:** `artifacts/wp-techsites-plugin/wp-techsites-plugin-v1.0.0.zip`

### Constantes importantes
```php
WPTS_VERSION   = '1.1.0'
WPTS_API_BASE  = 'https://wp.techsites.ai/api/wp'
WPTS_PLUGIN_DIR / WPTS_PLUGIN_URL
```

### Autenticação
O plugin usa **chave API** (`X-WP-Site-Key`), não JWT. Toda chamada ao API Server inclui este header. A chave é gerada no cadastro via `POST /api/wp/register`.

### Features do Painel Admin

| ID | Nome | Status | Créditos | Implementada |
|----|------|--------|----------|--------------|
| content | Conteúdo IA | 🟢 ATIVO | 5 | ✅ Completa |
| colors | Identidade Visual | 🟢 ATIVO | 2 | ✅ Completa |
| menu | Menu Builder | 🟢 ATIVO | 3 | ✅ Completa |
| chatbot | Chatbot IA | 🟢 ATIVO | 1 | ✅ Completa |
| directory | Directory Builder | 🔴 EM BREVE | 10 | ❌ Placeholder |
| scraping | Scraping & Index | 🔴 EM BREVE | 20 | ❌ Placeholder |
| listings | Listings Manager | 🔴 EM BREVE | 5 | ❌ Placeholder |
| logo-ai | Logo IA | 🔴 EM BREVE | 15 | ❌ Placeholder |
| logo-swap | Troca de Logo | 🔴 EM BREVE | 2 | ❌ Placeholder |
| wysiwyg | Editor WYSIWYG | 🔴 EM BREVE | 0 | ❌ Placeholder |
| seo | SEO Audit | 🔴 EM BREVE | 10 | ❌ Placeholder |
| ads | Ad Campaign IA | 🔴 EM BREVE | 8 | ❌ Placeholder |
| analytics | Analytics | 🔴 EM BREVE | 0 | ❌ Placeholder |

### AJAX actions registrados
- `wpts_create_post` — cria rascunho de post/página no WP
- `wpts_save_css` — salva CSS de identidade no banco WP
- `wpts_apply_menu` — cria/atualiza menu de navegação

---

## 3. API Server — Rotas WP TechSites

**Base:** `https://wp.techsites.ai/api/wp`  
**Auth:** Header `X-WP-Site-Key: <uuid>`  
**Arquivo:** `artifacts/api-server/src/routes/wp-techsites.ts`

### Endpoints públicos (sem chave)

```
POST /api/wp/register
  Body: { ownerEmail, siteName, siteUrl, ownerName }
  Resposta: { apiKey, siteId, credits, plan }
  - Cria site + chave API
  - 150 créditos de trial grátis
  - Se email já existe, retorna chave existente
```

### Endpoints autenticados (requerem X-WP-Site-Key)

```
GET  /api/wp/verify
  Resposta: { connected, siteName, siteUrl, credits, plan, tools[] }

POST /api/wp/generate-content
  Body: { topic, type, tone, language }
  Resposta: { title, metaDescription, content, excerpt, creditsUsed }
  - Debita 5 créditos

POST /api/wp/apply-colors
  Body: { primaryColor, secondaryColor, style }
  Resposta: { css, creditsUsed }
  - Debita 2 créditos

POST /api/wp/generate-menu
  Body: { niche, language }
  Resposta: { menuItems[{label, slug, icon}], creditsUsed }
  - Debita 3 créditos

POST /api/wp/chat
  Body: { message, context? }
  Resposta: { reply, creditsUsed }
  - Debita 1 crédito
```

### Modelo de IA
- **Motor:** Gemini (via `GEMINI` env var)
- Fallback: retorna erro descritivo se API indisponível

---

## 4. Banco de Dados — Tabelas WP TechSites

**DB:** `apex` no PostgreSQL (VPS 179.197.229.207)  
**Schema:** `lib/db/src/schema/wp-sites.ts`

### Tabela: `wp_sites`
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | serial PK | ID interno |
| api_key | text UNIQUE | UUID gerado no registro |
| owner_email | text | Email do responsável |
| site_name | text | Nome do site WP |
| site_url | text | URL base do WP |
| credits | integer | Créditos disponíveis |
| plan | text | 'trial' / 'starter' / 'pro' |
| is_active | boolean | Site ativo/bloqueado |
| created_at | timestamp | Data de cadastro |

> ⚠️ A tabela é criada automaticamente no startup da API (sem migration separada).

---

## 5. Dashboard SaaS (React)

**Artifact:** `artifacts/wp-techsites/`  
**URL:** `https://wp.techsites.ai`  
**Rotas:**

| Rota | Componente | Função |
|------|-----------|--------|
| `/` | Registration + Dashboard | Cadastro se sem chave; dashboard se conectado |
| `/dashboard` | Dashboard | Status, créditos, ferramentas |
| `/setup` | Setup Guide | Guia de instalação do plugin |
| `/tools/content` | Content Tool | Gerador de conteúdo |
| `/tools/colors` | Colors Tool | Identidade visual |
| `/tools/menu` | Menu Builder | Construtor de menu |

**Auth:** localStorage — chave API salva como `wpts_api_key`.

---

## 6. cwb.site — Especificação Técnica

### O que é
Primeiro Yellow Pages (diretório local) de Curitiba — `cwb.site`.  
Modelo: listagens gratuitas + premium pagas. Base de dados via scraping automatizado.

### Stack planejada
```
WordPress (tema directory) + Plugin WP TechSites
  ↕ Plugin → API TechSites
    → N8N Workflow (orquestração)
      → BrightData SERP API (scraping)
        → PostgreSQL (armazenamento)
          → Plugin renderiza listagens via CPT (Custom Post Type)
```

### Fluxo de scraping (N8N)

```
Trigger (Webhook ou Schedule)
  → N8N: BrightData SERP Request
      query: "restaurants curitiba" / "hotels curitiba" etc.
      dataset: Google Maps / Google Search
  → N8N: Parse & Normalize
      extrai: nome, endereço, telefone, site, categoria, rating
  → N8N: Dedup check (PostgreSQL)
  → N8N: HTTP POST → /api/wp/directory/ingest
      cria/atualiza CPT "listing" no WordPress via WP REST API
  → N8N: Notify admin (email/Slack)
```

### Custom Post Types necessários no plugin

```php
// CPT: listing
post_type: 'wpts_listing'
campos:
  - wpts_business_name (text)
  - wpts_address (text)
  - wpts_phone (text)
  - wpts_website (url)
  - wpts_category (taxonomy: wpts_category)
  - wpts_neighborhood (taxonomy: wpts_neighborhood)
  - wpts_rating (float)
  - wpts_premium (boolean)
  - wpts_premium_expires (date)
  - wpts_source (text: 'scraping'|'manual'|'claimed')
  - wpts_brightdata_id (text: ID único da fonte)
```

### Taxonomias
- `wpts_category`: Restaurantes, Hotéis, Lojas, Saúde, Serviços, etc.
- `wpts_neighborhood`: Batel, Centro, Água Verde, Boa Vista, etc.

### Listing Premium
- Campos extras: galeria de fotos, horário de funcionamento, descrição longa
- Badge "PREMIUM" na listagem
- Destaque nas buscas (ordenação)
- Cobrança: Stripe/MP via API TechSites
- Gerenciado pelo anunciante via painel próprio (futuro)

### Endpoints API a criar

```
POST /api/wp/directory/ingest
  Auth: X-WP-Site-Key
  Body: { listings: [...] }
  Cria/atualiza CPTs via WP REST API

GET  /api/wp/directory/categories
  Retorna categorias disponíveis com contagem

POST /api/wp/directory/search
  Body: { query, category?, neighborhood?, page }
  Busca com filtros

POST /api/wp/directory/premium/subscribe
  Body: { listingId, plan }
  Inicia cobrança para listing premium
```

---

## 7. BrightData — Como usar

**Secret:** `BRIGHTDATA` (disponível no Replit Secrets)

### SERP API (recomendado para cwb.site)
```javascript
const response = await fetch('https://api.brightdata.com/datasets/v3/trigger', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.BRIGHTDATA}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    dataset_id: 'gd_l7q7dkf244hwjntr0',  // Google Maps dataset
    include_errors: true,
    trigger_type: 'manual',
    data: [
      { keyword: 'restaurantes curitiba', country: 'BR', language: 'pt' },
      { keyword: 'hoteis curitiba', country: 'BR', language: 'pt' }
    ]
  })
});
```

### Datasets úteis
| Dataset | ID | Uso |
|---------|-----|-----|
| Google Maps | `gd_l7q7dkf244hwjntr0` | Negócios locais com endereço/rating |
| Google Search | `gd_l1vikfnt1wgvvqz95w` | SERP geral |
| Yellow Pages BR | verificar dashboard | Diretório nativo |

### N8N Node para BrightData
Use o node **HTTP Request** no N8N:
- URL: `https://api.brightdata.com/datasets/v3/trigger`  
- Method: POST  
- Auth: Header `Authorization: Bearer {{$env.BRIGHTDATA}}`

---

## 8. N8N Workflows

**VPS N8N:** acessar via `N8N_VPS_HOST` (secret)  
**API Key:** `N8N_API_KEY` (secret)  
**Base URL:** `N8N_BASE_URL` (secret)

### Workflows a criar para cwb.site

1. **`cwb-scraping-google-maps`**
   - Trigger: Schedule (diário, 3h da manhã)
   - Etapas: BrightData → Parse → Dedup → Ingest API → Email report

2. **`cwb-listing-premium-payment`**
   - Trigger: Webhook (Stripe checkout.session.completed)
   - Etapas: Verificar pagamento → Ativar premium no DB → Email para anunciante

3. **`cwb-reindex`**
   - Trigger: Webhook manual ou Schedule (semanal)
   - Etapas: Buscar listagens desatualizadas → Re-scrape → Atualizar

### Formato de dados do N8N → API

```json
{
  "listings": [
    {
      "brightdata_id": "gm_abc123",
      "business_name": "Restaurante Exemplo",
      "address": "Rua XV de Novembro, 100, Centro, Curitiba, PR",
      "phone": "(41) 99999-9999",
      "website": "https://exemplo.com.br",
      "category": "Restaurantes",
      "neighborhood": "Centro",
      "rating": 4.5,
      "source": "scraping"
    }
  ]
}
```

---

## 9. Tarefas para o Plantonista

### Prioridade ALTA (antes da apresentação)

- [ ] **Apontar domínio `wp.techsites.ai`** → VPS 179.197.229.207 (porta 8080)
- [ ] **Criar site WordPress de demo** → `demo.wp.techsites.ai` (ou usar WP.com/local)
- [ ] **Instalar plugin no WP demo** → fazer upload do ZIP, ativar, configurar API key
- [ ] **Criar conta admin** em `wp.techsites.ai/admin` para gerenciar usuários
- [ ] **Testar o loop completo**: Cadastro → API Key → Plugin conectado → Gerar conteúdo → Criar post

### Prioridade MÉDIA (pós-apresentação)

- [ ] Implementar CPT `wpts_listing` no plugin
- [ ] Criar workflow N8N `cwb-scraping-google-maps` com BrightData
- [ ] Criar endpoint `/api/wp/directory/ingest`
- [ ] Configurar `cwb.site` com WordPress + plugin
- [ ] Implementar listings premium com Stripe

### Prioridade BAIXA (roadmap)

- [ ] Logo IA (integrar com gerador de imagens)
- [ ] Troca de logo (WP Customizer API)
- [ ] Editor WYSIWYG (integrar com Gutenberg/block editor)
- [ ] SEO Audit (integrar com Google Search Console API)
- [ ] Ad Campaign (integrar com Google Ads API)
- [ ] Analytics (integrar com Google Analytics)

---

## 10. Instalação Local para Desenvolvimento

```bash
# 1. Clonar e instalar dependências
git clone <repo> && cd repo
pnpm install

# 2. Iniciar API server
pnpm --filter @workspace/api-server run dev

# 3. Iniciar Dashboard WP TechSites
pnpm --filter @workspace/wp-techsites run dev

# 4. Criar banco de dados local
createdb wp_techsites_dev
# Tabelas criadas automaticamente no startup da API

# 5. Configurar .env do api-server
# DATABASE_URL=postgresql://postgres@localhost/wp_techsites_dev
# GEMINI=<sua-chave>
# GROK=<sua-chave>
```

### Empacotar plugin
```bash
cd artifacts/wp-techsites-plugin
zip -r wp-techsites-plugin-v1.1.0.zip . --exclude="*.DS_Store" --exclude=".git/*"
```

---

## 11. Credenciais e Secrets (Replit Secrets)

| Secret | Uso |
|--------|-----|
| `BRIGHTDATA` | BrightData SERP API para scraping |
| `N8N_API_KEY` | Autenticação na API do N8N |
| `N8N_BASE_URL` | URL base do N8N (ex: http://n8n.vps:5678) |
| `N8N_VPS_HOST` | IP/hostname do servidor N8N |
| `GEMINI` | Google Gemini API (IA do chatbot/tools) |
| `GROK` | xAI Grok API (IA principal) |
| `STRIPE_SECRET_KEY` | Stripe para pagamentos |
| `STRIPE_WEBHOOK_SECRET` | Validação de webhooks Stripe |
| `VPS_ROOT_PASSWORD` | Acesso SSH à VPS principal |

> ⚠️ **NUNCA** commitar esses valores. Usar sempre via `process.env.SECRET_NAME`.

---

## 12. Estrutura de Arquivos

```
artifacts/
├── wp-techsites/           ← Dashboard SaaS (React/Vite)
│   └── src/
│       ├── pages/          ← dashboard, registration, setup, tools/*
│       ├── components/     ← layout/shell, ui/*
│       └── lib/            ← auth.ts, api.ts, i18n.ts
│
├── wp-techsites-plugin/    ← Plugin WordPress
│   ├── wp-techsites.php    ← Plugin principal (tudo em 1 arquivo)
│   ├── assets/
│   │   └── chatbot.js      ← Script do chatbot injetado no frontend
│   └── wp-techsites-plugin-v1.1.0.zip  ← ZIP instalável
│
artifacts/api-server/src/routes/
└── wp-techsites.ts         ← Todas as rotas /api/wp/*

lib/db/src/schema/
└── wp-sites.ts             ← Schema da tabela wp_sites
```

---

*Documento gerado em 2026-08-01 por Replit Agent.*  
*Próxima revisão: após implementação do Directory Builder.*
