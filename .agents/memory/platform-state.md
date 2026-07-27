---
name: Estado da Plataforma
description: Mapa completo de infraestrutura, projetos e acesso — atualizado após auditoria completa Jul/2026
---

## 3 VPS

- **VPS 1 Node.js** 179.197.229.207 — SSH via .agents/deploy_key — PM2: mediageek + deploy-webhook
- **VPS 2 N8N** 187.77.37.75 — SSH root bloqueado — acesso: N8N_BASE_URL + N8N_API_KEY — 50 workflows
- **VPS 3 Hostgator** redewp.com — SSH bloqueado — acesso: WHM API token — 4 contas cPanel

## Cloudflare TechSites ✅ ACESSO TOTAL
- 14 zonas DNS, 10 Pages projects, 17 Workers scripts
- Pages: directory-template-master (dubai.fond.coffee), global-fond-coffee (global.fond.coffee), gym-techsites-01, template-master-onepage, ts-saas-tech, ts-marketing-agency, ts-portfolio-freelancer, ts-ecom-single-product, ts-fitness-wellness, ts-dentist-medical
- Workers: techsites-hub-production, techsites-editor-api-production, techsites-proxy-production, pixelforge-hub-production, + 13 outros
- **8 Pages sem repo GitHub** — deploy manual, sem CI/CD — corrigir ao conectar engine

## Cloudflare MediaGeek ⚠️ DNS ONLY
- DNS ✅ (16 registros, mediageek.io → 179.197.229.207)
- Pages/Workers ❌ (token sem Account scope)
- Impacto: nenhum agora — MediaGeek roda no VPS, não em Pages

## N8N — 50 Workflows
- PixelForge: 9 ON (SaaS Fiverr em produção)
- TechSites/WaaS: 5 ON, 7 OFF (Maestro Fábrica OFF)
- W-Series Outreach: 7 ON (pipeline B2B completo)
- SEOContent: 1 ON (audit), 16 OFF (V4.0 Unified é mais recente)

## WYSIWYG Editor — Em Produção
Workers ativos servindo clientes: agency, dentist, mokha (café), real-estate, techprospect, trial-dubai, lawyer-accountant. Frontend via Workers, não via VPS.

## PixelForge
SaaS Fiverr em produção. Workers: pixelforge-hub-production + dev. N8N: 9 workflows ON. Frontend: localização desconhecida — verificar com usuário.

## Hostgator cPanel (4 contas)
redewp.com (468M) · pousadasaopedrotimbo.com.br (1017M) · net.mediageek.io (297M) · driverscopilot.app (408M)

## Esteira
1. MediaGeek reconstrução (inglês + Stripe only)
2. TechSites engine/build.js + conectar Pages a repos GitHub
3. SEOContent V4.0 ativar
4. PixelForge mapear e documentar
