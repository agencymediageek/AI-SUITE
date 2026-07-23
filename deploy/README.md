# 🏗️ Sistema de Plataformas Filhas — MediaGeek White-Label

## Arquitetura de Isolamento

Cada plataforma filha é uma **ilha completamente independente**.
Nenhuma mudança em uma afeta as outras.

```
/var/www/
├── mediageek/          ← Plataforma mãe (MediaGeek AI)
│   └── artifacts/ai-suite/
├── juridicai/          ← Filha 1 (exemplo: nicho jurídico)
│   └── artifacts/ai-suite/
├── nutriai/            ← Filha 2 (exemplo: nicho saúde)
│   └── artifacts/ai-suite/
└── template-filha/     ← BASE: clone desta para criar novas filhas
    └── artifacts/ai-suite/
```

### O que é isolado por plataforma
| Recurso | Isolado? |
|---|---|
| Código-fonte | ✅ Branch própria no GitHub |
| Banco de dados | ✅ PostgreSQL DB próprio |
| Processo PM2 | ✅ Nome único |
| Porta | ✅ Porta única (3001, 3002…) |
| Domínio | ✅ Nginx + SSL independentes |
| Variáveis de ambiente | ✅ .env.local próprio |

---

## 🚀 Criar uma nova plataforma filha

### Pré-requisito: branch template-filha atualizada
```bash
# Na máquina de desenvolvimento ou no VPS:
git checkout template-filha
git merge main   # puxar melhorias da plataforma mãe
git push origin template-filha
```

### Deploy de nova filha (1 comando)
```bash
bash /var/www/mediageek/deploy/deploy-filha.sh <nome> <dominio> <db_senha>

# Exemplos:
bash /var/www/mediageek/deploy/deploy-filha.sh juridicai juridicai.com.br MinhaS3nha
bash /var/www/mediageek/deploy/deploy-filha.sh nutriai   nutriai.com.br   OutraS3nha
bash /var/www/mediageek/deploy/deploy-filha.sh eduai     eduai.com.br     MaisUmaSenha
```

O script faz tudo automaticamente (clone, banco, build, PM2) e imprime
um checklist do que configurar manualmente depois.

---

## 📝 Customizar uma filha após o deploy

### 1. Branding (nicho.config.ts)
```bash
nano /var/www/<nome>/artifacts/ai-suite/nicho.config.ts
```
Configure: nome, domínio, cores, nicho, ferramentas em destaque.

### 2. Logo e favicon
```bash
# Substituir pelo logo da nova plataforma:
cp logo-nova.png /var/www/<nome>/artifacts/ai-suite/public/logo.png
cp favicon-nova.ico /var/www/<nome>/artifacts/ai-suite/public/favicon.ico
```

### 3. Ferramentas por plano (admin panel)
Acesse `https://<dominio>/admin` → Plans → edite cada plano e marque
apenas as ferramentas relevantes para o nicho.

### 4. Chaves de API (.env.local)
```bash
nano /var/www/<nome>/artifacts/ai-suite/.env.local
# Preencha: GROK, STRIPE_SECRET_KEY, MERCADO_PAGO_ACCESS_TOKEN
```

### 5. Rebuild e restart
```bash
cd /var/www/<nome>/artifacts/ai-suite
npm run build && pm2 restart <nome>
```

---

## 🔄 Propagar melhorias da mãe para as filhas

Quando melhorar a MediaGeek e quiser aplicar nas filhas:

```bash
# 1. Atualizar branch template-filha com as melhorias
git checkout template-filha
git merge main --no-ff -m "sync: melhorias da mãe → template"
git push origin template-filha

# 2. Em cada filha que quiser atualizar (atenção: revisar conflitos)
cd /var/www/<nome-da-filha>
git fetch origin
git merge origin/template-filha --no-ff

# 3. Rebuild da filha
cd artifacts/ai-suite
npm run build && pm2 restart <nome>
```

> ⚠️ **NUNCA** rode `merge` de uma filha na outra diretamente.
> Sempre use `template-filha` como canal de propagação.

---

## 📊 Monitorar todas as plataformas

```bash
pm2 list                    # Ver todas rodando
pm2 logs mediageek          # Logs da mãe
pm2 logs juridicai          # Logs de uma filha
pm2 monit                   # Dashboard em tempo real
```

---

## 🗂️ Branches no GitHub

| Branch | Propósito |
|---|---|
| `main` | Código da MediaGeek AI (plataforma mãe) |
| `template-filha` | Base limpa para clonar novas filhas |
| `filha/juridicai` | Código customizado da JuridicAI (exemplo) |
| `filha/nutriai` | Código customizado da NutriAI (exemplo) |

---

## 🧠 Nichos sugeridos com base nas 80+ ferramentas disponíveis

| Nicho | Nome sugerido | Ferramentas em foco |
|---|---|---|
| Jurídico | JuridicAI | contract-generator, privacy-policy, terms-of-service, disclaimer-generator, refund-policy |
| Saúde | NutriAI / SaúdeAI | meal-plan, workout-routine, symptom-journal, recipe |
| Educação | EduAI | quiz, lesson-plan, study-guide, flashcard-generator, math-solver, interview |
| Marketing | MktAI | reel-generator, marketing-image, social, instagram-caption, facebook-ads, google-ads |
| Dev | DevAI | code, bug-fix, code-reviewer, api-docs, docker-compose, sql, regex-generator |
| Finanças | FinancAI | finance, swot-analysis, business-plan, elevator-pitch, kpi-dashboard |
| RH | RhAI | resume, job-description, interview, onboarding-checklist, meeting |
