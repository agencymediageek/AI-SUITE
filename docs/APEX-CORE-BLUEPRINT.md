# APEX CORE MEETING — Blueprint Completo
> Guia de construção de SaaS Enterprise AI. Versão 1.0 — Julho 2026  
> Criado por TechSites AI · Model para replicação em dezenas de nichos

---

## 📐 O QUE É ESTE DOCUMENTO

Este blueprint documenta **cada decisão arquitetural, stack, convenção e processo** usado para construir o APEX CORE MEETING — uma plataforma SaaS Enterprise que usa IA para conduzir reuniões e executar ações reais em tempo real.

**Finalidade:** Servir de matriz para todos os próximos SaaS de nicho da TechSites AI. O segundo SaaS deve levar metade do tempo.

---

## 🏗️ STACK COMPLETA

| Camada | Tecnologia | Motivo |
|---|---|---|
| **Frontend** | React 19 + Vite + TypeScript | Máxima performance, HMR rápido |
| **Styling** | Tailwind CSS v4 + shadcn/ui | Design system pronto, dark mode nativo |
| **State** | Zustand | Simples, sem boilerplate, JWT storage |
| **Routing** | Wouter | Leve, sem overhead do React Router |
| **Forms** | React Hook Form + Zod | Validação type-safe |
| **Data Fetching** | TanStack Query v5 | Cache, loading states, mutations |
| **API Client** | OpenAPI + codegen (orval) | Tipos gerados automaticamente da spec |
| **Backend** | Node.js + Express + Fastify-compatible | REST API, JWT auth, middleware |
| **Database** | PostgreSQL (Replit managed) + Drizzle ORM | Type-safe queries, migrations automáticas |
| **AI** | Grok 3 Mini (x.ai) | Baixo custo, alta velocidade, raciocínio |
| **Voz (TTS)** | Web Speech API → ElevenLabs (v2) | Síntese de voz profissional |
| **Voz (STT)** | Web Speech Recognition API | Transcrição em tempo real no browser |
| **Monorepo** | pnpm workspaces | Shared libs, builds otimizados |
| **Deploy Frontend** | Cloudflare Pages | CDN global, zero config, gratuito |
| **Deploy Backend** | VPS Hostgator + PM2 + Nginx | Controle total, SSL, reverse proxy |
| **DNS/CDN** | Cloudflare | Proteção DDoS, cache, SSL automático |
| **CI/CD** | GitHub Actions | Deploy automático em push para main |
| **Pagamentos** | Stripe + Mercado Pago | Brasil (MP) + global (Stripe) |

---

## 📁 ESTRUTURA DO MONOREPO

```
workspace/
├── artifacts/
│   ├── apex-meeting/          ← Frontend SaaS (React + Vite)
│   │   ├── src/
│   │   │   ├── pages/         ← Rotas: landing, dashboard, meetings, auth...
│   │   │   ├── components/    ← UI components (Navbar, MatrixGlobe, etc.)
│   │   │   ├── lib/           ← auth.ts, i18n.tsx, theme.tsx, utils.ts
│   │   │   └── App.tsx        ← Router principal com todas as rotas
│   │   ├── vite.config.ts
│   │   └── package.json
│   └── api-server/            ← Backend Express API
│       ├── src/
│       │   ├── routes/        ← auth.ts, meetings.ts, whitelabel.ts, tools.ts
│       │   ├── middleware/     ← authenticate.ts (JWT), rate-limit
│       │   └── lib/           ← tools-data.ts (80+ ferramentas)
│       ├── ecosystem.config.cjs ← PM2 config
│       └── package.json
├── lib/
│   ├── db/                    ← Drizzle ORM, schema, migrations
│   │   └── src/schema/        ← users, generations, meetings, sessions, whitelabel
│   ├── api-spec/              ← OpenAPI 3.0 YAML (fonte da verdade dos tipos)
│   └── api-client-react/      ← Hooks gerados via codegen (orval)
├── scripts/
│   └── post-merge.sh          ← Roda após merge de task agents
├── .github/workflows/
│   └── deploy.yml             ← CI/CD GitHub Actions
└── pnpm-workspace.yaml
```

---

## 🗄️ SCHEMA DO BANCO DE DADOS

```sql
-- Usuários e autenticação
users (
  id, email, password_hash, name, role (user|admin),
  plan_id, token_balance, created_at
)

-- Geração de conteúdo IA genérica
generations (
  id, user_id FK, tool_id, input, output, tokens_used,
  status, created_at
)

-- Favoritos
favorites (
  id, user_id FK, generation_id FK, created_at
)

-- Planos de assinatura
plans (
  id, name, price, interval, features[], stripe_price_id,
  mp_plan_id, active
)

-- Configuração por ferramenta (sobrepõe tools-data.ts)
tools_config (
  id, tool_id UNIQUE, enabled, n8n_webhook_url, custom_prompt
)

-- APEX CORE MEETING — Salas
meetings (
  id, user_id FK, title, company, ai_name,
  language (pt|en|es), resources[], briefing_text,
  status (active|archived), created_at
)

-- APEX CORE MEETING — Sessões ao vivo
meeting_sessions (
  id, meeting_id FK, status (active|ended),
  transcript TEXT, summary TEXT, built_assets[],
  started_at, ended_at
)

-- White-label
whitelabel_configs (
  id, user_id FK UNIQUE, ai_name, logo_url,
  primary_color, accent_color, company_name, subdomain
)
```

---

## 🔐 AUTENTICAÇÃO

**Padrão JWT em localStorage:**

```typescript
// lib/auth.ts — padrão para todos os SaaS
const TOKEN_KEY = 'apex_meeting_token'; // troca por [saas_name]_token

export const useAuthStore = create<AuthState>()(
  persist({ token, user, setToken, clearToken }, { name: TOKEN_KEY })
);

// Wiring com API client (feito uma vez no App.tsx)
setAuthTokenGetter(() => useAuthStore.getState().token);
```

**Rotas protegidas:**
- `GET /api/auth/me` — retorna user ou 401
- `POST /api/auth/login` — JWT 7 dias
- `POST /api/auth/register` — cria conta

---

## 🤖 INTEGRAÇÃO COM IA

**Hierarquia de chamadas:**
1. Se ferramenta tem `n8nWebhookUrl` → chama N8N webhook (automação complexa)
2. Fallback → Grok 3 Mini direto via API `x.ai`

```typescript
// Pattern para qualquer SaaS
const response = await fetch('https://api.x.ai/v1/chat/completions', {
  headers: { Authorization: `Bearer ${process.env.GROK}` },
  body: JSON.stringify({
    model: 'grok-3-mini',
    messages: [
      { role: 'system', content: systemPrompt },  // contexto do produto
      { role: 'user', content: userMessage }
    ]
  })
});
```

**Para reuniões ao vivo (APEX CORE):**
- STT: `window.SpeechRecognition` (gratuito, browser nativo)
- TTS: `window.speechSynthesis` (rápido) ou ElevenLabs (qualidade profissional)
- Globe Matrix pulsa via `isProcessing` prop

---

## 🌐 INFRAESTRUTURA DE PRODUÇÃO

### Frontend (Cloudflare Pages)
```bash
# Build
PORT=3001 BASE_PATH=/ pnpm --filter @workspace/[saas-name] run build

# Deploy via Wrangler
npx wrangler pages deploy artifacts/[saas-name]/dist/public \
  --project-name [saas-name] \
  --branch main
```

### Backend (VPS + PM2 + Nginx)
```bash
# VPS: 179.197.229.207 (Hostgator)
# PM2 process: apex-api (port 8080)
# Nginx: /etc/nginx/sites-available/apex-techsites

# Nginx config pattern (SSL + proxy)
server {
  listen 443 ssl;
  server_name [subdomain].techsites.ai;
  root /var/www/mediageek/artifacts/[saas-name]/dist/public;
  
  location /api/ {
    proxy_pass http://127.0.0.1:8080;
  }
  
  location / {
    try_files $uri $uri/ /index.html;
    add_header Cache-Control "no-cache";
  }
  
  # Assets com cache longo (Vite usa hash nos nomes)
  location ~* \.(js|css|png|jpg|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
}
```

### DNS (Cloudflare)
```bash
# Criar registro A
# apex.techsites.ai → 179.197.229.207 (proxied=true)
# Zona techsites.ai: aaa2418ffbb69192aa3546436397ccac
```

### CI/CD (GitHub Actions)
```yaml
# .github/workflows/deploy.yml
# Trigger: push para main
# Jobs: build apex → deploy CF Pages + build api → SSH VPS + PM2 restart
```

---

## 💳 MODELO DE MONETIZAÇÃO

| Plano | Preço BR | Plano EN | Features |
|---|---|---|---|
| **Starter** | R$297/mês | $59/mo | 1 sala, 5 sessões/mês, IA padrão |
| **Pro** | R$697/mês | $139/mo | 10 salas, ilimitadas, white-label |
| **Enterprise** | Sob consulta | Custom | Ilimitado, subdomínio, SLA |

**Gateways:**
- Brasil: Mercado Pago (PIX + cartão)
- Global: Stripe

---

## 🎨 IDENTIDADE VISUAL APEX CORE

| Token | Valor |
|---|---|
| Preto base | `#000000` |
| Verde Matrix (primary) | `#00FF41` |
| Ciano (secondary) | `#00FFFF` |
| Font body | Inter / sans-serif |
| Font mono | JetBrains Mono / monospace |
| Globe logo | MatrixGlobe canvas component |

---

## 🔄 PROCESSO DE REPLICAÇÃO (Novo SaaS em < 1 semana)

### Dia 1 — Setup (2h)
1. `cp -r artifacts/apex-meeting artifacts/[novo-saas]`
2. Atualizar `package.json` name, `vite.config.ts` port
3. Registrar artifact no `artifact.toml`
4. Trocar cores em `index.css` (`--primary`, `--secondary`)
5. Trocar textos: nome do produto, tagline, features

### Dia 2 — Backend (3h)
1. Criar schema Drizzle para novas entidades
2. Adicionar rotas Express específicas
3. Atualizar `openapi.yaml` + rodar codegen
4. Configurar prompt do sistema para a IA do nicho

### Dia 3 — Frontend (4h)
1. Reescrever `landing.tsx` com copy do nicho
2. Ajustar `dashboard.tsx` para o produto específico
3. Criar páginas de funcionalidade core
4. Atualizar `i18n.tsx` com textos PT/EN/ES

### Dia 4 — Infra (2h)
1. Criar CF Pages project
2. Criar DNS record no Cloudflare
3. Configurar Nginx no VPS
4. Testar deploy end-to-end

### Dia 5 — Monetização + Lançamento (3h)
1. Criar produtos no Stripe + Mercado Pago
2. Configurar webhook de pagamento
3. Setup contas admin + demo
4. Deploy final + campanha

---

## 📋 CHECKLIST PRÉ-LANÇAMENTO

- [ ] Login/Register funcionando
- [ ] Fluxo core da IA funcionando (ao menos demonstração)
- [ ] Planos de preços configurados
- [ ] Checkout Stripe + MP funcionando
- [ ] Landing page com todas as seções
- [ ] Mobile responsivo testado (375px+)
- [ ] Domínio HTTPS funcionando
- [ ] Admin panel acessível
- [ ] Emails transacionais configurados
- [ ] Política de privacidade + termos publicados
- [ ] Google Analytics / Meta Pixel instalados
- [ ] OG tags para compartilhamento social

---

## 🚀 PODE VENDER? (Resposta direta)

**Sim, com as seguintes condições:**

1. ✅ Validação técnica — flow completo testado end-to-end por pelo menos 1 usuário real
2. ✅ Pagamento funcionando — Stripe ou MP aceitando transação real
3. ✅ Admin pode gerenciar usuários/planos
4. ⚠️ Recomendado — 7 dias de garantia declarados (remove fricção de compra)
5. ⚠️ Recomendado — pelo menos 1 depoimento ou caso de uso real antes de escalar budget

**Canais de lançamento recomendados:**
- LinkedIn orgânico (C-Suite, diretores, VPs)
- Meta Ads (cargo: CEO, CTO, COO · empresa: 50-500 funcionários)
- Cold outreach direto para empresas-alvo

---

## 👥 CONTAS PADRÃO DE DEMONSTRAÇÃO

| Tipo | Email | Senha padrão |
|---|---|---|
| Admin | `admin@[dominio]` | `Admin@[Produto]2026!` |
| Demo | `demo@[dominio]` | `Teste@[Produto]2026!` |

> **Trocar senhas em produção antes de lançar.**

---

## 📎 LINKS E REFERÊNCIAS

- **Live:** https://apex.techsites.ai
- **GitHub:** https://github.com/agencymediageek/AI-SUITE
- **API Base:** https://apex.techsites.ai/api
- **Admin:** https://apex.techsites.ai/admin
- **CF Pages:** apex-meeting.pages.dev
- **VPS:** 179.197.229.207 (Hostgator)
- **Zona CF:** aaa2418ffbb69192aa3546436397ccac

---

*Documento mantido por TechSites AI · Atualizado: Julho 2026*
