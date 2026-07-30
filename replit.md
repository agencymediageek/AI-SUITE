# Projeto Mediageek / TechSites — Mapa da Mina

> Guia completo de arquitetura, deploy, debug e operação. Mantenha este arquivo atualizado a cada mudança relevante.

---

## Visão Geral do Projeto

Este monorepo pnpm contém todos os produtos do ecossistema Mediageek/TechSites:

| Artifact | Tipo | Domínio | Servidor |
|---|---|---|---|
| `ai-suite` | Next.js 14 | mediageek.io | VPS PM2 `mediageek` |
| `ai-suite-platform` | React+Vite | — | Replit preview |
| `apex-meeting` | React+Vite | apex.techsites.ai | CF Pages + VPS API |
| `apex-video` | React+Vite | apex-video.pages.dev | CF Pages |
| `techsites-landing` | React+Vite | techsites.ai | CF Pages |
| `waashost-landing` | React+Vite | www.waas.host | CF Pages |
| `api-server` | Express | — | Replit preview |
| `mockup-sandbox` | Vite | — | Replit preview (canvas) |

---

## Infraestrutura

### VPS Principal
- **IP:** `179.197.229.207`
- **OS:** Ubuntu/Debian
- **SSH:** `ssh -i .agents/deploy_key root@179.197.229.207`
- **SSH Key:** `.agents/deploy_key` (gitignored, mas existe no repo do Replit)

### PM2 Processos no VPS
```bash
pm2 list                          # Listar todos
pm2 logs mediageek --lines 50    # Logs do mediageek.io
pm2 restart mediageek             # Reiniciar mediageek
pm2 show mediageek                # Info detalhada
```

| Processo | Porta | Diretório | Comando |
|---|---|---|---|
| `mediageek` | 3000 | `/var/www/mediageek/artifacts/ai-suite/` | `pnpm start` |
| `apex-api` | 8080 | `/var/www/apex/` | `node server.js` |

### Nginx
- Config: `/etc/nginx/sites-available/mediageek` e `apex`
- SSL: Let's Encrypt para mediageek.io; self-signed para apex (CF termina SSL)
- Logs: `/var/log/nginx/access.log` e `error.log`

### Cloudflare
**Conta PRINCIPAL** (secrets `CLOUDFLARE_ACCOUNT_ID` + `CLOUDFLARE_API_TOKEN` no Replit):
- Zone `techsites.ai` → CF Pages `techsites-ai`
- Zone `waas.host` → CF Pages `waashost`
- CF Pages `apex-meeting` → apex.techsites.ai (custom domain)
- CF Pages `apex-video` → apex-video.pages.dev

**Conta MEDIAGEEK** (secrets `CLOUDFLARE_MEDIAGEEK_ACCOUNT_ID` + `CLOUDFLARE_MEDIAGEEK_API_TOKEN`):
- Zone `mediageek.io` → proxy para VPS 179.197.229.207 (nginx → porta 3000)

### GitHub Actions CI/CD
- Arquivo: `.github/workflows/deploy.yml`
- **ATENÇÃO:** As secrets `CLOUDFLARE_ACCOUNT_ID` e `CLOUDFLARE_API_TOKEN` no **repositório GitHub** devem ser da conta PRINCIPAL (não MEDIAGEEK). Verificar em Settings → Secrets.
- CI deploia CF Pages para: `techsites-landing`, `waashost-landing`, `apex-meeting`, `apex-video`
- CI NÃO deploia mediageek.io (VPS deploy é manual ou via webhook)

---

## mediageek.io (ai-suite)

### Stack
- **Framework:** Next.js 14.2 (App Router)
- **DB:** PostgreSQL externo (Neon/Supabase) — credenciais em `.env.local` no VPS
- **Auth:** JWT em cookie httpOnly + Zustand store (cliente)
- **AI:** Gemini 2.0 Flash direto ou N8N webhook

### Variáveis de Ambiente (VPS: `/var/www/mediageek/artifacts/ai-suite/.env.local`)
```
DATABASE_URL=<connection string>
POSTGRES_URL=<connection string>
POSTGRES_URL_NON_POOLING=<connection string>
JWT_SECRET=<secret>
SESSION_SECRET=<secret>
NEXT_PUBLIC_APP_URL=https://mediageek.io
NEXT_PUBLIC_BASE_DOMAIN=mediageek.io
NODE_ENV=production
```

### Deploy no VPS
```bash
# SSH no VPS
ssh -i .agents/deploy_key root@179.197.229.207

# Atualizar código
cd /var/www/mediageek
git pull origin main

# Rebuild (leva 3-5 minutos)
cd artifacts/ai-suite
nohup pnpm run build > /tmp/aisuite_build.log 2>&1 &
tail -f /tmp/aisuite_build.log   # Acompanhar progresso

# Reiniciar após build
pm2 restart mediageek
```

### Tabelas do Banco
```sql
users           -- email, password (bcrypt), role, status, name, emailVerified
settings        -- configurações globais do app (defaultTokens, AI keys, etc)
user_balances   -- email, balance (tokens), updated_at
token_logs      -- email, amount, action, feature, model, timestamp
generations     -- histórico de gerações de AI
favorites       -- conteúdo favoritado por usuário
plans           -- planos de assinatura
user_plans      -- vínculo usuário → plano
```

### Usuários Admin
| Email | Senha | Role |
|---|---|---|
| `reynaldodallin@gmail.com` | `Admin@2026!` | admin |

### Problemas Conhecidos e Soluções

**Login retorna 500 via URL pública:**
- Causa: `createSession()` → `cookies().set(secure:true)` falha quando nginx faz SSL termination
- Fix aplicado: try-catch em `createSession` com fallback `secure:false`; `export const dynamic='force-dynamic'` na rota de login
- Se acontecer novamente: verificar se `TRUST_PROXY=true` está no `.env.local`

**Build retorna warnings "Dynamic server usage":**
- Normal. As rotas com `request.url` são compiladas como dinâmicas (símbolo `ƒ` no output)
- Não são erros, não afetam funcionamento

**"Failed to find Server Action":**
- Browser está usando cache de build antigo
- Solução: usuário deve fazer hard-refresh (Ctrl+Shift+R) ou limpar cache do browser
- Se persistir: purgar CF cache → Cloudflare dashboard → Cache → Purge Everything

**Registro retorna 500:**
- Causa histórica: `db.initFreeBalance` não existia em `src/lib/db.ts`
- Fix aplicado: método adicionado (linha ~413 em db.ts)

---

## APEX CORE MEETING (apex-meeting)

### Stack
- **Frontend:** React + Vite, Tailwind CSS
- **Backend:** Express API no VPS (PM2 `apex-api`, porta 8080)
- **Deploy Frontend:** Cloudflare Pages (`apex-meeting`)
- **Domínio:** apex.techsites.ai

### Fluxo de Deploy
1. Push para `main` no GitHub
2. CI roda `pnpm --filter @workspace/apex-meeting run build`
3. CI deploia para CF Pages usando conta PRINCIPAL (não MEDIAGEEK)
4. VPS faz `git pull` via webhook (ou manual)

### Arquivos Chave
```
artifacts/apex-meeting/src/
├── pages/landing.tsx         # Landing page principal
├── pages/meeting.tsx         # Sala de reunião com AI
├── components/VoiceAssistant.tsx  # Componente de voz
```

### API Backend (VPS)
- Roda em porta 8080 (PM2 `apex-api`)
- Logs: `pm2 logs apex-api --lines 50`
- Restart: `pm2 restart apex-api`

---

## TechSites Landing (`techsites-landing`)

- **Domínio:** techsites.ai
- **Deploy:** CF Pages `techsites-ai`
- **Conta CF:** PRINCIPAL
- CI deploia em todo push para `main`

---

## WaasHost Landing (`waashost-landing`)

- **Domínio:** www.waas.host
- **Deploy:** CF Pages `waashost`
- **Conta CF:** PRINCIPAL

---

## APEX Video Demo (`apex-video`)

- **Domínio:** apex-video.pages.dev
- **Deploy:** CF Pages `apex-video`
- **Referenciado em:** `artifacts/apex-meeting/src/pages/landing.tsx` (seção #demo)
- CI deploia em todo push para `main`

---

## Desenvolvimento Local (Replit)

### Iniciar todos os serviços
Os workflows já estão configurados. Usar o seletor de artifact no preview para navegar entre eles.

### Estrutura do Monorepo
```
/
├── artifacts/
│   ├── ai-suite/          # mediageek.io (Next.js 14)
│   ├── ai-suite-platform/ # Plataforma AI (React+Vite)
│   ├── apex-meeting/      # APEX CORE MEETING
│   ├── apex-video/        # Demo de vídeo do APEX
│   ├── techsites-landing/ # Landing TechSites
│   ├── waashost-landing/  # Landing WaasHost
│   ├── api-server/        # API Express compartilhada
│   └── mockup-sandbox/    # Canvas para prototipação
├── lib/
│   └── db/src/schema/     # Schema do banco (Drizzle)
├── .github/workflows/     # CI/CD
├── .agents/
│   ├── deploy_key         # SSH key (gitignored)
│   └── memory/            # Memória persistente do agente
└── replit.md              # Este arquivo
```

### Portas e Roteamento
Cada artifact usa a variável `$PORT` (auto-atribuída pelo Replit). O preview usa path-based routing:
- `/ai-suite` → ai-suite
- `/ai-suite-platform` → ai-suite-platform
- `/apex-meeting` → apex-meeting
- etc.

---

## Secrets e Variáveis de Ambiente

### No Replit (usados pelo CI e agentes)
| Secret | Uso |
|---|---|
| `CLOUDFLARE_ACCOUNT_ID` | Conta CF PRINCIPAL |
| `CLOUDFLARE_API_TOKEN` | Token CF PRINCIPAL |
| `CLOUDFLARE_MEDIAGEEK_ACCOUNT_ID` | Conta CF MEDIAGEEK |
| `CLOUDFLARE_MEDIAGEEK_API_TOKEN` | Token CF MEDIAGEEK (zone mediageek.io) |
| `GITHUB_TOKEN` | Push/pull no repo principal |
| `GITHUB_TOKEN_TECHSITES` | Repo TechSites |
| `VPS_ROOT_PASSWORD` | SSH no VPS (fallback) |
| `STRIPE_SECRET_KEY` | Pagamentos Stripe |
| `MERCADO_PAGO_ACCESS_TOKEN` | Pagamentos Mercado Pago |
| `GEMINI` | Gemini AI API Key |
| `GROK` | Grok AI API Key |
| `N8N_API_KEY` | N8N automações |
| `SESSION_SECRET` | JWT sessions |

### No VPS (em cada `.env.local`)
Os arquivos `.env.local` NÃO estão no git. Em caso de perda, recriar via SSH.

---

## Diagnóstico Rápido

### mediageek.io está fora
```bash
# 1. Verificar PM2
pm2 list | grep mediageek

# 2. Verificar nginx
systemctl status nginx

# 3. Testar direto (bypass nginx)
curl http://localhost:3000/api/health

# 4. Verificar logs
tail -f /var/log/pm2/mediageek-error.log
```

### CF Pages não atualizou
```bash
# Ver deployments recentes
curl -s "https://api.cloudflare.com/client/v4/accounts/$CF_ACCOUNT/pages/projects/apex-meeting/deployments" \
  -H "Authorization: Bearer $CF_TOKEN" | jq '.result[0].latest_stage'
```

### Banco de dados inacessível
```bash
# Testar conexão (de dentro do VPS, na pasta ai-suite)
node -e "
const fs=require('fs');
const lines=fs.readFileSync('.env.local','utf8').split('\n');
lines.forEach(l=>{const[k,...v]=l.split('=');if(k&&v.length)process.env[k.trim()]=v.join('=').trim()});
const {Pool}=require('./node_modules/pg');
const p=new Pool({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:false}});
p.query('SELECT NOW()',(e,r)=>{console.log(e||r.rows[0]);p.end()});
"
```

---

## Tarefas em Andamento

Ver lista de tasks no painel de tarefas do projeto. As mais críticas:
- **Task #33** — Planos de assinatura reais para APEX (IN_PROGRESS)
- **Task #42** — Checkout Stripe + Mercado Pago (bloqueado pelo #33)

---

## User Preferences

- Português brasileiro em todas as respostas e documentação
- Não perguntar confirmação para tarefas simples — executar diretamente
- Manter estrutura do monorepo pnpm existente
- Preferir correções cirúrgicas a reescritas completas
- Testar antes de considerar tarefa concluída
