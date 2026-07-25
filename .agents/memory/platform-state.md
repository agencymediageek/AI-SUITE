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
