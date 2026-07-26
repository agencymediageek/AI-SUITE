---
name: Estado da Plataforma
description: Status atual dos dois projetos ativos — MediaGeek e TechSites — credenciais, decisões e o que falta para amanhã
---

## MediaGeek AI (mediageek.io)

**Estado:** Funcional no VPS, zero clientes, não lançado.

**Decisões confirmadas:**
- Reconstruir/simplificar o código (menos complexidade, mais segurança)
- Somente inglês (remover qualquer estrutura multi-idioma)
- Somente Stripe (remover Mercado Pago completamente)
- Deploy continua no VPS via GitHub Actions → PM2

**Bugs móbile:** todos corrigidos e deployados (8 bugs, julho 2026). Documentado em `docs/relatorio-bugs-mobile-julho-2026.md`.

**Tarefas pendentes (tasks propostas):**
- Task #4: Corrigir bug que apaga todos os favoritos ao remover um
- Task #5: Criar conta de administrador para acessar /admin
- Task #3: Deploy automático no Hostinger quando atualizar o GitHub

**Credenciais disponíveis:**
- `STRIPE_SECRET_KEY` ✅
- `STRIPE_WEBHOOK_SECRET` ✅
- `GEMINI` ✅
- `GROK` ✅
- `SESSION_SECRET` ✅
- `VPS_ROOT_PASSWORD` ✅
- `GITHUB_TOKEN` ✅
- SSH deploy key em `.agents/deploy_key` (gitignored)

---

## TechSites (techsites.ai) — Sistema SYNEX

**Estado:** Arquitetura documentada, zero código de automação implementado. Único site em produção: `techsites.ai`.

**O que é SYNEX:**
Sistema de IA/automação que orquestra a criação de directory sites. Totalmente especificado em blueprints no Google Drive (`techsites-hub-main/`). Documentos principais:
- SYNEX CORE BLUEPRINT - PROTOCOLO DE ATIVAÇÃO MESTRE
- SYNEX-DEFINICAO-E-DESCRICAO
- SYNEX-ESCOPO-PROMPTS-TECHSITES-FINAL
- Arquitetura Operacional do Synex
- Stack Operacional TechSites — GitHub, Cloudflare, n8n e VPS

**O que precisa ser construído (prioridade):**
1. `engine/build.js` — Node.js script que lê config.json + partials → gera site estático completo
2. Partials: nav.html, footer.html, card-listing.html (extrair do Dubai Coffee)
3. CSS variables consolidadas (remover os 20+ hex hardcoded)
4. CI/CD: GitHub Actions → Cloudflare Pages (arquivo `deploy-pages.yml` existe no Drive, 2 versões)

**Domínios Cloudflare (14, conta TechSites):**
- `techsites.ai` ✅ live
- `fond.coffee`, `places.guide`, `hq.tips`, `saas.tips`, `waas.host`, `llc.reviews`, `cult.tips`, `hub.guide`, `spots.tips`, `clever.reviews`, `thebest.tips`, `hho.expert`, `velorestudio.com.br` — a maioria sem DNS configurado

**GitHub repos relevantes:**
- `dubai-coffee-rebuild` — template base de directory (HTML estático, 41 arquivos com navbar duplicada)
- `techsites-templates` — 10 nichos HTML (coach, dentist, ecom, fitness, lawyer, etc.)
- `directory-factory` — somente documentação (sem código de automação)
- `techsites-hub-docs` — somente prompts

**Credenciais disponíveis:**
- `CLOUDFLARE_ACCOUNT_ID` ✅ (conta TechSites)
- `CLOUDFLARE_API_TOKEN` ✅ (conta TechSites)
- `GITHUB_TOKEN_TECHSITES` ✅
- `GDRIVE_TECHSITES_CREDENTIALS` ✅ (legacy — substituído pelo Replit connector)
- Google Drive Connector ✅ `conn_google-drive_01KYDYZQZPA4G0RKX1Y494YWKA` (adicionado Jul/2026)
- `BRIGHTDATA` ✅ (para scraping de listings)
- `MERCADO_PAGO_ACCESS_TOKEN` ✅ (não usado no TechSites)

**Credenciais MediaGeek Cloudflare:**
- `CLOUDFLARE_MEDIAGEEK_ACCOUNT_ID` ✅ (adicionado Jul/2026)
- `CLOUDFLARE_MEDIAGEEK_API_TOKEN` ✅ (adicionado Jul/2026)
- Zona `mediageek.io` confirmada ativa via API
- ⚠️ Token sem permissão `Cloudflare Pages: Read/Edit` — usuário vai corrigir amanhã

**O que falta verificar amanhã:**
- Permissão Pages no token Cloudflare MediaGeek
- Conector Cloudflare no Replit (status: `requires_setup` — precisa ser ativado em Settings → Connectors)
- Audit dos N8N workflows no VPS (IP/hostname necessário)
- Verificar se `CLOUDFLARE_ACCOUNT_ID` (TechSites) tem permissão de Pages também

**Auditórias salvas:**
- `docs/auditoria-techsites-julho-2026.md` — GitHub + Cloudflare TechSites
- `docs/auditoria-gdrive-julho-2026.md` — Google Drive completo
