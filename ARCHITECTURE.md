# MediaGeek AI Suite — Arquitetura do Projeto

> **Leia este arquivo primeiro.** Ele descreve a stack completa, a estrutura de pastas, os serviços e as variáveis de ambiente necessárias. Qualquer IA ou desenvolvedor que assuma o projeto deve começar por aqui.

---

## Visão Geral

O MediaGeek AI Suite é uma plataforma SaaS de ferramentas de IA construída como um **monorepo pnpm** com dois serviços principais:

| Serviço | Tecnologia | Função |
|---|---|---|
| **Frontend** | React 19 + Vite 7 + Wouter | Interface web do usuário |
| **Backend (API)** | Express + Node.js + Pino | API REST + autenticação + integrações |
| **Banco de dados** | PostgreSQL + Drizzle ORM | Persistência de usuários, geraçÕes, planos |
| **Automações** | N8N (self-hosted) | Workflows de IA via webhooks |
| **WordPress Plugin** | PHP | Plugin WooCommerce + integração com o SaaS |

**Importante:** Este NÃO é um template CodeCanyon modificado. É uma aplicação construída do zero, inspirada no design do AI Suite, com código 100% próprio.

---

## Estrutura de Pastas

```
/
├── artifacts/
│   ├── ai-suite-platform/      ← Frontend React (porta $PORT)
│   │   └── src/
│   │       ├── pages/          ← Rotas da aplicação (landing, dashboard, tools, pricing…)
│   │       ├── components/     ← UI components (shadcn/ui + customizados)
│   │       ├── lib/
│   │       │   ├── i18n.tsx    ← Sistema de internacionalização customizado (PT/EN)
│   │       │   └── auth.ts     ← JWT client-side + Zustand store
│   │       └── hooks/          ← React hooks customizados
│   │
│   ├── api-server/             ← Backend Express (porta $PORT)
│   │   └── src/
│   │       ├── routes/         ← Endpoints REST (auth, tools, payments, user, dashboard…)
│   │       ├── lib/
│   │       │   ├── auth.ts     ← JWT middleware (requireAuth)
│   │       │   └── tools-data.ts ← Catálogo estático de 80+ ferramentas de IA
│   │       └── middlewares/    ← CORS, logging, rate limiting
│   │
│   └── mockup-sandbox/         ← Servidor de preview de componentes (uso interno)
│
├── lib/
│   ├── db/                     ← Schema Drizzle ORM + conexão PostgreSQL
│   │   └── src/schema/
│   │       ├── users.ts        ← Tabela users (plano, créditos, idioma)
│   │       ├── generations.ts  ← Histórico de gerações de IA
│   │       ├── favorites.ts    ← Ferramentas favoritas por usuário
│   │       ├── plans.ts        ← Definição dos planos (Free, Pro, Business)
│   │       └── tools_config.ts ← Configurações de ferramentas por usuário/admin
│   ├── api-spec/               ← Especificação OpenAPI da API
│   ├── api-zod/                ← Schemas de validação Zod compartilhados
│   └── api-client-react/       ← Cliente React Query para o frontend
│
├── n8n-workflows/              ← Workflows JSON para importar no N8N
│   ├── ALL-WORKFLOWS-IMPORT.json ← Todos os workflows em um arquivo
│   ├── core-workflow.json      ← Geração de conteúdo core
│   ├── social-workflow.json    ← Redes sociais
│   ├── marketing-workflow.json ← Marketing
│   └── …                       ← (10+ workflows por categoria)
│
├── wordpress-plugin/
│   └── ai-suite-woocommerce/   ← Plugin PHP para integração WP + WooCommerce
│
├── scripts/                    ← Scripts utilitários de banco e build
├── ARCHITECTURE.md             ← Este arquivo
├── CHANGELOG.md                ← Histórico de recursos implementados
└── README.md                   ← Setup e primeiros passos
```

---

## Rotas do Frontend

| Rota | Tipo | Descrição |
|---|---|---|
| `/` | Pública | Landing page com hero, features, preços, depoimentos |
| `/login` | Pública | Login → redireciona para `/tools` |
| `/register` | Pública | Cadastro de novo usuário |
| `/como-funciona` | Pública | Como funciona o serviço |
| `/faq` | Pública | Perguntas frequentes |
| `/contato` | Pública | Formulário de contato |
| `/pricing` | Pública | Planos e preços (Mercado Pago / Stripe) |
| `/tools` | 🔒 Auth | Catálogo de ferramentas de IA |
| `/tools/:toolId` | 🔒 Auth | Página de uso da ferramenta |
| `/dashboard` | 🔒 Auth | Painel com estatísticas de uso |
| `/history` | 🔒 Auth | Histórico de gerações |
| `/account` | 🔒 Auth | Perfil e configurações da conta |
| `/admin` | 🔒 Admin | Painel de administração |
| `/features/*` | Pública | Landing pages dedicadas por ferramenta |

---

## Endpoints da API

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `POST` | `/api/auth/register` | — | Criar conta |
| `POST` | `/api/auth/login` | — | Login + retorna JWT |
| `GET` | `/api/auth/me` | ✅ | Dados do usuário logado |
| `GET` | `/api/tools` | ✅ | Lista todas as ferramentas |
| `POST` | `/api/ai/generate` | ✅ | Gerar conteúdo com IA (Gemini/N8N) |
| `GET` | `/api/user/favorites` | ✅ | Ferramentas favoritas |
| `POST` | `/api/user/favorites` | ✅ | Adicionar favorito |
| `DELETE` | `/api/user/favorites/:toolId` | ✅ | Remover favorito |
| `GET` | `/api/dashboard/stats` | ✅ | Estatísticas de uso |
| `POST` | `/api/payments/mp/create-preference` | ✅ | Criar preferência Mercado Pago |
| `POST` | `/api/payments/stripe/create-session` | ✅ | Criar sessão Stripe Checkout |
| `POST` | `/api/payments/mp/webhook` | — | Webhook de confirmação MP |
| `POST` | `/api/payments/stripe/webhook` | — | Webhook de confirmação Stripe |

---

## Autenticação

- **Estratégia:** JWT (JSON Web Token) com expiração de 7 dias
- **Storage client:** `localStorage` com chave `auth_token`
- **State management:** Zustand (`useAuthStore`) + `setAuthTokenGetter` wired ao api-client-react
- **Middleware backend:** `requireAuth` em `artifacts/api-server/src/lib/auth.ts`
- **Fluxo:** Login → JWT retornado → armazenado no localStorage → enviado em todo request como `Authorization: Bearer <token>`

---

## Sistema de i18n (Internacionalização)

- **Implementação:** Context API customizado (`useI18n`) em `artifacts/ai-suite-platform/src/lib/i18n.tsx`
- **Idiomas:** Português (`pt`) e Inglês (`en`)
- **Detecção automática:** `ipapi.co` detecta o país do visitante; Brasil → PT + R$; outros → EN + USD
- **Troca manual:** Botão de globo no header (público e app)
- **Moedas:** `currency: "BRL" | "USD"` com `formatPrice()` que converte USD→BRL via taxa fixa

---

## Banco de Dados

- **ORM:** Drizzle ORM (`lib/db/`)
- **Banco:** PostgreSQL (Replit PostgreSQL em desenvolvimento; variável `DATABASE_URL` em produção)
- **Migrations:** `pnpm --filter @workspace/db run db:push` para aplicar schema

### Tabelas principais

| Tabela | Descrição |
|---|---|
| `users` | id, name, email, password_hash, role, plan, credits, language, created_at |
| `generations` | id, user_id, tool_id, prompt, result, tokens_used, created_at |
| `favorites` | id, user_id, tool_id, created_at |
| `plans` | id, name, price_usd, credits_monthly, features |
| `tools_config` | id, tool_id, n8n_webhook_url, is_active, config_json |

---

## Ferramentas de IA

- **Catálogo:** 80+ ferramentas definidas estaticamente em `artifacts/api-server/src/lib/tools-data.ts`
- **Geração de IA:**
  - Se a ferramenta tem `n8nWebhookUrl` configurado → chama N8N webhook
  - Caso contrário → chama Gemini 2.0 Flash diretamente via API
- **N8N:** Workflows prontos em `n8n-workflows/` para importar em instância própria

---

## Variáveis de Ambiente Obrigatórias

### Backend (`artifacts/api-server`)

| Variável | Obrigatório | Descrição |
|---|---|---|
| `DATABASE_URL` | ✅ | Connection string do PostgreSQL |
| `JWT_SECRET` | ✅ | Segredo para assinar JWTs (mínimo 32 chars) |
| `SESSION_SECRET` | ✅ | Segredo de sessão Express |
| `GEMINI` | ✅ | API Key do Google Gemini (AI generation) |
| `MERCADO_PAGO_ACCESS_TOKEN` | ✅ | Token de produção do Mercado Pago |
| `STRIPE_SECRET_KEY` | ✅ | Secret Key do Stripe (sk_live_...) |
| `STRIPE_WEBHOOK_SECRET` | ✅ | Segredo de webhook do Stripe (whsec_...) |
| `APP_BASE_URL` | ✅ | URL base da aplicação (ex: https://aisuite.mediageek.io) |
| `GROK` | — | API Key do Grok (reservado para uso futuro) |
| `BRIGHTDATA` | — | API Key BrightData (scraping, uso futuro) |
| `N8N_BASE_URL` | — | URL da instância N8N (se usar webhooks) |

### Frontend (`artifacts/ai-suite-platform`)

| Variável | Obrigatório | Descrição |
|---|---|---|
| `VITE_API_URL` | — | URL da API (padrão: mesma origem via proxy) |

---

## Modo Claro/Escuro

- **Biblioteca:** `next-themes` (`^0.4.6`)
- **Modo:** `attribute="class"` — adiciona `class="dark"` ou `class="light"` no `<html>`
- **Default:** `dark`
- **Toggle:** disponível no header público e no sidebar do app

---

## Planos e Preços

| Plano | Preço (USD) | Créditos/mês |
|---|---|---|
| Free | $0 | 50 |
| Pro | $29 | 1.000 |
| Business | $79 | 5.000 |
| Agency | $199 | Ilimitado |

---

## Gateway de Pagamentos

- **Brasil (BRL):** Mercado Pago Checkout Pro
- **Internacional (USD):** Stripe Checkout
- **Detecção:** automática via país do ipapi.co
- **Ativação do plano:** via webhook após confirmação de pagamento

---

## Como a IA deve trabalhar neste projeto

1. **Leia `ARCHITECTURE.md` (este arquivo) primeiro**
2. Leia `CHANGELOG.md` para entender o que já foi implementado
3. Consulte `replit.md` para preferências do usuário
4. Consulte `.agents/memory/MEMORY.md` para decisões arquiteturais passadas
5. Nunca misture código deste projeto com arquivos do template CodeCanyon original
6. Nunca exponha secrets em código — use variáveis de ambiente
7. Mantenha a separação frontend/backend (não adicione lógica de banco no frontend)
