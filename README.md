# MediaGeek AI Suite

Plataforma SaaS de ferramentas de IA para agências e criadores de conteúdo.  
Construída sobre React 19 + Express + PostgreSQL em monorepo pnpm.

> 📖 Para entender a arquitetura completa, leia [`ARCHITECTURE.md`](./ARCHITECTURE.md).  
> 📋 Para ver o que foi implementado, leia [`CHANGELOG.md`](./CHANGELOG.md).  
> 🚀 Para fazer deploy, leia [`.github/DEPLOY.md`](./.github/DEPLOY.md).

---

## Requisitos

- Node.js 20+
- pnpm 9+
- PostgreSQL 15+

---

## Setup Local

### 1. Clonar o repositório

```bash
git clone https://github.com/seu-usuario/mediageek-ai-suite.git
cd mediageek-ai-suite
```

### 2. Instalar dependências

```bash
pnpm install
```

### 3. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz (nunca commite este arquivo):

```env
# Banco de dados
DATABASE_URL=postgresql://user:password@localhost:5432/mediageek

# Autenticação
JWT_SECRET=seu_segredo_jwt_minimo_32_caracteres
SESSION_SECRET=seu_segredo_de_sessao

# IA
GEMINI=sua_api_key_google_gemini

# Pagamentos
MERCADO_PAGO_ACCESS_TOKEN=seu_token_mp_producao
STRIPE_SECRET_KEY=sk_live_sua_chave_stripe
STRIPE_WEBHOOK_SECRET=whsec_seu_segredo_webhook_stripe

# App
APP_BASE_URL=https://aisuite.mediageek.io
NODE_ENV=development
```

### 4. Aplicar schema do banco

```bash
pnpm --filter @workspace/db run db:push
```

### 5. Iniciar em desenvolvimento

```bash
# Frontend (porta $PORT ou 3000)
pnpm --filter @workspace/ai-suite-platform run dev

# Backend (porta $PORT ou 3001)
pnpm --filter @workspace/api-server run dev
```

---

## Estrutura do Projeto

```
artifacts/ai-suite-platform/   ← Frontend React
artifacts/api-server/          ← Backend Express
lib/db/                        ← Schema PostgreSQL
n8n-workflows/                 ← Workflows de automação
wordpress-plugin/              ← Plugin WooCommerce
```

---

## Tecnologias

| Camada | Stack |
|---|---|
| Frontend | React 19, Vite 7, Wouter, TanStack Query, shadcn/ui, Tailwind CSS 4 |
| Backend | Express, Node.js, Pino, esbuild |
| Banco | PostgreSQL, Drizzle ORM |
| IA | Google Gemini 2.0 Flash, N8N |
| Auth | JWT, Zustand, bcrypt |
| Pagamentos | Mercado Pago, Stripe |
| i18n | Context API customizado (PT/EN) |
| Temas | next-themes (dark/light) |

---

## Produção

O projeto roda em [aisuite.mediageek.io](https://aisuite.mediageek.io) via Replit Autoscale.  
Veja `.github/DEPLOY.md` para instruções de deploy na VPS Hostinger.

---

## Licença

Código proprietário — MediaGeek © 2025. Todos os direitos reservados.
