# CHANGELOG — MediaGeek AI Suite

> Registro de todos os recursos customizados implementados. Serve como referência para entender o que foi adicionado ao projeto em relação a um template base genérico.

---

## [Atual] — Julho 2025

### 🏗️ Arquitetura Base
- Monorepo pnpm com workspace packages (`artifacts/*`, `lib/*`)
- Frontend: React 19 + Vite 7 + Wouter (roteamento) + TanStack Query + shadcn/ui
- Backend: Express + Node.js + Pino logger + esbuild (build via `build.mjs`)
- Banco: PostgreSQL + Drizzle ORM com schema em `lib/db/src/schema/`
- Shared libs: `@workspace/api-spec`, `@workspace/api-zod`, `@workspace/api-client-react`, `@workspace/db`

### 🌐 Internacionalização (i18n)
- Sistema customizado via React Context (`useI18n`) — sem biblioteca externa
- Idiomas: Português (`pt`) e Inglês (`en`)
- Detecção automática de país via `ipapi.co` — Brasil → PT/BRL; outros → EN/USD
- Formatação de preços com conversão USD→BRL (taxa configurável)
- Troca manual de idioma com ícone de globo no header (público + app)
- Chatbot muda de idioma junto com a interface

### 🔐 Autenticação
- JWT com expiração de 7 dias
- Armazenamento em `localStorage` com chave `auth_token`
- Estado global via Zustand (`useAuthStore`)
- `setAuthTokenGetter` integrado ao `@workspace/api-client-react`
- Middleware `requireAuth` no backend para rotas protegidas
- Após login → redireciona para `/tools`

### 🏠 Landing Page Pública
- Hero com gradientes animados e orbs de fundo
- Stats coloridas: 50k+ usuários, 100+ ferramentas, 10M+ gerações, 99.9% uptime
- Cards de ferramentas com gradientes únicos por categoria (6 cores distintas)
- Seção "Como Funciona" com 3 passos animados
- Seção "Trusted by 50,000+ Professionals" com marquee de marcas
- Seção "Loved by Creators Worldwide" com 6 depoimentos e avatares coloridos
- Seção de preços integrada
- Trust badges (segurança, velocidade, cancelamento, suporte PT)
- Chatbot flutuante

### 🧭 Navegação Pública
- Menu: HOME · HOW IT WORKS · PRICING · FAQ · CONTACT (todos em maiúsculo)
- Toggle de tema claro/escuro (ícone lua/sol) ao lado do globo
- "Ferramentas" removido do menu público (requer login)
- "Ver todas as ferramentas" → `/login`
- Botão "Get Started Free" → `/register`

### 🌙 Modo Claro/Escuro
- `next-themes` com `attribute="class"` e `defaultTheme="dark"`
- Toggle funcional no header público e no sidebar do app
- Sem classes `dark` hardcoded nos layouts

### 🛠️ Catálogo de Ferramentas de IA
- 80+ ferramentas definidas estaticamente em `tools-data.ts`
- Categorias: Content, Social, Marketing, SEO, Design, Code, Business, Legal, Finance, Education, Personal
- Geração de IA: Gemini 2.0 Flash (default) ou N8N webhook por ferramenta
- Ferramentas favoritas (salvas por usuário no banco)
- Página de detalhe por ferramenta com formulário de prompt

### 💬 Chatbot
- Widget flutuante disponível em todo o site
- Integrado ao sistema de i18n (responde no idioma da interface)
- Powered by Gemini 2.0 Flash

### 💳 Pagamentos
- **Mercado Pago Checkout Pro** (Brasil / BRL):
  - Rota: `POST /api/payments/mp/create-preference`
  - Conversão USD→BRL automática
  - Campos de retorno: `back_urls` com success/failure/pending
  - `external_reference` com `userId|planId` para tracking
- **Stripe Checkout** (Internacional / USD):
  - Pendente implementação completa (Task #2)
- Detecção de gateway via localização (`ipapi.co`)

### 📄 Páginas Informativas
- `/como-funciona` — Como funciona o serviço (PT/EN)
- `/faq` — Perguntas frequentes (PT/EN)
- `/contato` — Formulário de contato (PT/EN)

### 🏛️ Painel do Usuário (App)
- `/dashboard` — Estatísticas de uso, gerações recentes
- `/tools` — Catálogo completo de ferramentas
- `/history` — Histórico de gerações
- `/account` — Perfil e configurações
- `/admin` — Painel de administração (role: admin)

### 📊 Landing Pages de Ferramentas
- `/features/ai-influencer` — AI Influencer Studio
- `/features/viral-reels` — Gerador de Reels Virais
- `/features/thumbnail-maker` — Criador de Thumbnails Pro
- `/features/music-creator` — Music Creator
- `/features/website-builder` — Website Builder
- `/features/manga-studio` — Manga Studio

### 🔄 N8N Workflows
- 12 workflows prontos para importar em instância N8N própria
- Categorias: core, social, marketing, SEO, business, creative, writing, education, finance, legal, personal, development
- Arquivo de importação completo: `n8n-workflows/ALL-WORKFLOWS-IMPORT.json`

### 🔌 WordPress Plugin
- `wordpress-plugin/ai-suite-woocommerce/` — Plugin PHP
- Integração WooCommerce com planos do SaaS
- Base para o ecossistema de templates vendáveis

---

## Pendências Conhecidas

| Item | Status | Observação |
|---|---|---|
| `MERCADO_PAGO_ACCESS_TOKEN` | ⚠️ Falta configurar | Token de produção no painel MP |
| `STRIPE_SECRET_KEY` + webhook | ⚠️ Falta implementar | Task #2 |
| Webhook MP (confirmação de pagamento) | ⚠️ Falta implementar | Task #2 |
| Ativação automática de plano pós-pagamento | ⚠️ Falta implementar | Task #2 |
| Bug: DELETE favoritos remove todos | 🐛 Bug conhecido | `.where(and(...))` faltando |
| Seed de conta admin | ⚠️ Falta | Nenhum admin seedado |
| Grok API | — | Secret configurado, não usado ainda |
