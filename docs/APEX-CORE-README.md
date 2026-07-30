# APEX CORE MEETING

> **IA que executa enquanto você fala.**  
> Plataforma SaaS Enterprise que conduz reuniões com inteligência artificial e executa ações reais — deploys, DNS, documentos — em tempo real.

[![Live](https://img.shields.io/badge/🌐_Live-apex.techsites.ai-00FF41?style=flat-square)](https://apex.techsites.ai)
[![Stack](https://img.shields.io/badge/Stack-React+Express+PostgreSQL-blue?style=flat-square)](https://github.com/agencymediageek/AI-SUITE)
[![AI](https://img.shields.io/badge/AI-Grok_3_Mini-purple?style=flat-square)](https://x.ai)

---

## 🎯 O que é

O **APEX CORE MEETING** é uma plataforma onde uma IA generativa conduz reuniões corporativas e executa tarefas reais enquanto os executivos falam. Ao invés de gerar uma lista de tarefas no final da reunião, a IA age imediatamente:

- 🌐 **Publica sites** — landing pages ficam no ar durante a reunião
- 🔧 **Configura DNS** — registros criados via API em segundos
- 📄 **Gera documentos** — relatórios, briefings, contratos
- 🎙️ **Escuta e responde** — voz em tempo real, sincronizado com o Matrix Globe

---

## 🖥️ Demo

| Tela | Descrição |
|---|---|
| **Landing** | Página de conversão completa com 7 seções |
| **Dashboard** | Gerenciamento de salas e histórico |
| **Live Meeting** | Globe Matrix + voz + terminal em tempo real |
| **White-label** | Configure nome e identidade da IA |
| **Admin** | Painel de controle de usuários e planos |

**Acesso demo:** `demo@apex.techsites.ai` / `Teste@Apex2026!`

---

## 🏗️ Arquitetura

```
Browser (React SPA)
    │
    ├── Cloudflare CDN/Pages (frontend)
    │
    ▼
Nginx (VPS 179.197.229.207)
    │
    ├── /api/* → Express API (PM2, port 8080)
    │               │
    │               ├── PostgreSQL (Replit managed)
    │               ├── Grok 3 Mini API (x.ai)
    │               └── N8N Webhooks (automações)
    │
    └── /* → Static files (React build)
```

---

## 🚀 Instalação Local

```bash
# 1. Clone
git clone https://github.com/agencymediageek/AI-SUITE
cd AI-SUITE

# 2. Instalar dependências
pnpm install --no-frozen-lockfile

# 3. Variáveis de ambiente (copiar e preencher)
cp .env.example .env.local
# Preencher: DATABASE_URL, GROK, SESSION_SECRET, STRIPE_SECRET_KEY

# 4. Banco de dados
pnpm --filter db push

# 5. Iniciar desenvolvimento
# Terminal 1: API
PORT=8080 pnpm --filter @workspace/api-server run dev

# Terminal 2: Frontend
PORT=3001 BASE_PATH=/ pnpm --filter @workspace/apex-meeting run dev
```

---

## 🌍 Deploy em Produção

### Frontend (Cloudflare Pages)
```bash
PORT=3001 BASE_PATH=/ pnpm --filter @workspace/apex-meeting run build
npx wrangler pages deploy artifacts/apex-meeting/dist/public \
  --project-name apex-meeting --branch main
```

### Backend (VPS)
```bash
# SSH no VPS
ssh root@179.197.229.207

# Pull + rebuild + restart
cd /var/www/mediageek
git pull origin main
pnpm --filter @workspace/api-server run build
pm2 restart apex-api
```

---

## 📦 Estrutura de Arquivos

```
artifacts/apex-meeting/src/
├── pages/
│   ├── landing.tsx       # Página principal de conversão
│   ├── dashboard.tsx     # Painel do usuário
│   ├── login.tsx         # Autenticação
│   ├── register.tsx      # Cadastro
│   ├── pricing.tsx       # Planos e preços
│   ├── settings.tsx      # Configurações + white-label
│   ├── admin.tsx         # Painel administrativo
│   ├── sobre.tsx         # Sobre o produto
│   ├── contato.tsx       # Formulário de contato
│   ├── faq.tsx           # Perguntas frequentes
│   └── meetings/
│       ├── new.tsx       # Criar sala
│       ├── [id].tsx      # Detalhes da sala
│       └── live.tsx      # Reunião ao vivo (core do produto)
├── components/
│   ├── layout/
│   │   └── Navbar.tsx    # Navegação responsiva
│   ├── meeting/
│   │   └── MatrixGlobe.tsx  # Globe Matrix animado (logo mark)
│   └── ui/               # shadcn/ui components
└── lib/
    ├── auth.ts           # JWT + Zustand store
    ├── i18n.tsx          # PT/EN/ES translations
    ├── theme.tsx         # Dark/light mode
    └── utils.ts          # Helpers
```

---

## 🎨 Design System

| Token | Valor |
|---|---|
| Primary (Matrix green) | `#00FF41` |
| Secondary (Cyan) | `#00FFFF` |
| Background | `#000000` |
| Logo | MatrixGlobe Canvas Component |

---

## 💳 Planos

| Plano | Preço | Principais recursos |
|---|---|---|
| Starter | R$297/mês | 1 sala, 5 sessões/mês |
| **Pro** ⭐ | R$697/mês | 10 salas, white-label, deploy |
| Enterprise | Sob consulta | Ilimitado, subdomínio, SLA 99.9% |

---

## 🔑 Variáveis de Ambiente

```env
DATABASE_URL=          # PostgreSQL connection string
SESSION_SECRET=        # JWT signing secret (min 32 chars)
GROK=                  # x.ai API key
STRIPE_SECRET_KEY=     # Stripe secret key
STRIPE_WEBHOOK_SECRET= # Stripe webhook secret
MERCADO_PAGO_ACCESS_TOKEN= # Mercado Pago token
N8N_BASE_URL=          # N8N instance URL
N8N_API_KEY=           # N8N API key
CLOUDFLARE_API_TOKEN=  # CF API para deploy
CLOUDFLARE_ACCOUNT_ID= # CF Account ID
```

---

## 📊 API Endpoints

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

GET    /api/meetings
POST   /api/meetings
GET    /api/meetings/:id
PATCH  /api/meetings/:id
DELETE /api/meetings/:id

POST   /api/meetings/:id/sessions
GET    /api/meetings/:id/sessions
PATCH  /api/meetings/:id/sessions/:sessionId
POST   /api/meetings/:id/ask

GET    /api/whitelabel
PUT    /api/whitelabel

GET    /api/tools
GET    /api/generations
POST   /api/generations
GET    /api/favorites
POST   /api/favorites
DELETE /api/favorites/:id
```

---

## 🤝 Contribuindo

Este projeto segue o padrão de monorepo TechSites AI. Para adicionar features:
1. Crie branch `feat/nome-da-feature`
2. Task agents gerenciam mudanças isoladas
3. PR para `main` aciona CI/CD automático

---

## 📄 Licença

Propriedade de TechSites AI. Todos os direitos reservados.  
Não distribua sem autorização expressa.

---

*Desenvolvido com ❤️ em São José dos Pinhais · TechSites AI 2026*
