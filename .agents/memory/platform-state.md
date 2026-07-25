---
name: Estado atual da plataforma MediaGeek AI
description: Status de cada área após a sessão de refinamento mobile + traduções PT
---

# Estado da plataforma (2026-07-25)

## O que está 100% funcional
- Deploy automático: push → GitHub Actions (8s) → webhook VPS → build → PM2 restart
- Website builder: JSON bug resolvido, temperatura 0.1 (resultados consistentes), prompt com regras de consistência
- Mobile scroll: page-scroll natural no mobile (overflow-hidden removido da cadeia de layout)
- Tradução PT: ~95% das views traduzidas (ver seção pendentes abaixo)
- Auth JWT, favoritos, plans, admin /admin

## Pendentes conhecidos (detectados, não corrigidos ainda)
- **Favoritos bug**: remover 1 favorito apaga todos (Task #4 proposta) — bug crítico pré-apresentação
- **Admin conta**: Task #5 proposta — reynaldodallin@gmail.com já tem role=admin
- **BrowserControlPage**: tool complexa com layouts overflow-hidden não auditada completamente
- **TradingTerminal, VoiceAgentPage**: layouts complexos não auditados para mobile

## Infraestrutura
- VPS: root@179.197.229.207, /var/www/mediageek, PM2 process mediageek porta 3000
- DB: PostgreSQL local, database mediageek
- Webhook receiver: PM2 process deploy-webhook porta 9876
- GitHub: agencymediageek/AI-SUITE, branch main

## Próximas prioridades (após apresentação)
1. Fix bug favoritos (task #4)
2. Backup automatizado do banco de dados
3. Documentação técnica completa
4. Sistema de redundância / failover
5. Rebuild limpo pós-apresentação (decidido na sessão anterior)

## Lições aprendidas — fixes mobile (julho 2026)

### Causa raiz do overflow horizontal
- Classe `container` do Tailwind tem `padding: "2rem"` no config do projeto
- Layout.tsx já adiciona `p-4 lg:p-6 xl:p-8` ao content area
- Qualquer componente dentro de Layout que use `container` sem override de padding = double-padding
- Fix: substituir `container max-w-X` por `w-full max-w-X mx-auto` (remove o padding extra do container)
- Afeta: ToolPage, HeadlineGenerator, InstagramCaptionGenerator

### Ícone "tic-tac" (oval) em flex containers
- Sem `shrink-0`, flex comprime a largura do wrapper de ícone mas mantém a altura → oval
- Fix: sempre adicionar `shrink-0` em wrappers de ícone com dimensões fixas (w-14 h-14 etc.)
- Título grande (`text-3xl`) ao lado do ícone piora o problema → usar `text-xl sm:text-2xl lg:text-3xl`
- Div de texto precisa de `min-w-0` para wrapping correto

### Flash no scroll da home page (mobile)
- Causa: elementos com `position: fixed` + `filter: blur(N px)` causam GPU repaint em cada scroll
- Afeta: Layout.tsx (3 orbs `blur-80px`) e LandingPage.tsx (3 blobs `blur-3xl`)
- Fix: `hidden lg:block` nesses containers — desktop mantém efeito, mobile sem repaint

### overflow-x mobile (universal)
- `overflow-x: hidden` no body: CSS spec força `overflow-y: auto` = body vira scroll container
- Mais confiável que `overflow-x: clip` (suporte limitado em browsers antigos)
- x-transforms Framer Motion (x: ±N) causam horizontal overflow durante animação → remover todos
