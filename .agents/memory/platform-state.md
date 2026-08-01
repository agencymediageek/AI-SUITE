---
name: Estado da plataforma
description: Status atual dos 3 produtos + infraestrutura — pós-sessão ai.mediageek.io
---

## Reunião de investidores: 6 de agosto de 2026

### Produtos

| Produto | Domínio | Status | Próximo passo |
|---------|---------|--------|---------------|
| AI MediaGeek | ai.mediageek.io | ✅ PRONTO | Rebranding (remover "AI Suite") |
| APEX Core | apex.techsites.ai | 🔄 IN_PROGRESS | Task #33: planos Stripe |
| WP TechSites | wp.techsites.ai | ⏳ PENDENTE | Apontar domínio |

---

## AI MediaGeek (ai.mediageek.io) — concluído em 2026-08-01

### O que foi feito
- Install.sh do aisuitemg base → porta 3012, DB aimediageek
- Branding: "AI MediaGeek", cor purple 262 80% 50%, logo SVG
- Motor: Grok 3 Fast (DEFAULT_MODEL_ID = "grok-3-fast")
- Idiomas: PT-BR + ES habilitados + 262 traduções (Grok) + AutoTranslator
- Planos: Starter $9/mo (30k tokens), Pro $29/mo (150k), Business $79/mo (500k)
- Stripe webhook registrado: we_1Tzbv2K1Gb20xyZUI4fTK7nA
- default_tokens = 300 para novas contas
- aiLimits inicializado: live-chat=15, image=20, audio=20, video=30
- Chatbot RAG: modelo atualizado para gemini-2.0-flash-exp
- Legal pages: /privacy, /terms, /cookies — 200 OK nativos

### Pendente
- Rebranding: remover "AI Suite" do frontend
- Ícone PWA: ainda mostra nome/logo do template original
- Aprovação para salvar como template white-label v1.0

---

## Infraestrutura VPS (179.197.229.207)

| PM2 | Porta | Domínio | DB |
|-----|-------|---------|-----|
| mediageek | 3000 | mediageek.io | mediageek |
| aisuitemg | 3010 | aisuitemg.mediageek.io | aisuitemg |
| clonemg | 3011 | clone.mediageek.io | clonemg |
| aimediageek | 3012 | ai.mediageek.io | aimediageek |
| apex-api | 8080 | apex.techsites.ai/api | apex |
| deploy-webhook | 9876 | internal | — |

Próxima porta: 3013+

---

## APEX Core (apex.techsites.ai)

- VPS port 8080, PM2 apex-api
- Task #33 IN_PROGRESS: planos Stripe e webhook
- Task #35 PENDING: domínio HTTPS
- Task #37 PENDING: loop de microfone
- Task #36 PENDING: voz ElevenLabs

**Why:** APEX é prioridade para a reunião de investidores — task #33 deve ser retomada.
