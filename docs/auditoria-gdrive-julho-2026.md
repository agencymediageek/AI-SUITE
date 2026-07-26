# Auditoria Google Drive — TechSites.ai
**Data:** Julho de 2026  
**Acesso via:** Replit Google Drive Connector  
**Escopo:** Drive completo — raiz + subpastas principais

---

## Resumo Executivo

O Google Drive funciona como **arquivo/base de conhecimento**, não como repositório de código. Contém blueprints, prompts, PDFs de decisões de projeto, e backups de documentos. Não há workflows N8N exportados em JSON, nenhum dado de listing, e nenhum arquivo de configuração de site pronto para uso.

---

## Estrutura Raiz — Arquivos Soltos (mais relevantes)

| Arquivo | Tipo | Data | Relevância |
|---|---|---|---|
| `action-center-site-factory-minimal.json` | JSON | Abr/2026 | **6 versões diferentes** — geradas pelo Perplexity em sessões separadas |
| `deploy-pages.yml` | YAML | Abr/2026 | **2 versões** — GitHub Actions para Cloudflare Pages |
| `BLUEPRINT-AUTOMACAO-DIRECTORY-GLOBAL.md` | MD | Abr/2026 | Arquitetura da automação global de directories |
| `BLUEPRINT-DESCRITIVO-WYSIWYG-STANDALONE-V1-1-1.md` | MD | Abr/2026 | Blueprint WYSIWYG descritivo |
| `BLUEPRINT-TECNICO-WYSIWYG-STANDALONE-V1-1-1.md` | MD | Abr/2026 | Blueprint técnico do WYSIWYG |
| `BLUEPRINT-HUB-EDITS.md` | MD | Abr/2026 | Blueprint do Hub |
| `DEPLOY-GITHUB-VS-WRANGLER.md` | MD | Abr/2026 | Comparativo de deploy: GitHub Actions vs Wrangler CLI |
| `ADENDO-MARCACAO-DATA-EDITABLE-WYSIWYG.md` | MD | Abr/2026 | Adendo técnico do WYSIWYG |
| `2026-04-19-wysiwyg-standalone-n8n.md` | MD | Abr/2026 | Integração WYSIWYG com N8N |
| `n8n-notification-templates.md` | MD | Abr/2026 | **2 versões** — templates de notificação N8N |
| `prompt-01-workflow-maestro.md` | MD | Abr/2026 | Prompt para o workflow maestro N8N |
| `perplexity-bridge-setup.md` | MD | Abr/2026 | Setup da bridge Perplexity |
| `perplexity-bridge.json` | JSON | Abr/2026 | Config da bridge Perplexity |
| `PADRAO-REPOSITORIOS-GDRIVE-GITHUB.md` | MD | Abr/2026 | Padrão de nomenclatura e organização |
| `app.js` | JS | Abr/2026 | Arquivo JavaScript solto (provável rascunho) |
| `pixelforge-cell-*.zip` | ZIP | Abr/2026 | 3 versões de arquivo ZIP (PixelForge?) |

**Diagnóstico:** 6 versões do mesmo `action-center-site-factory-minimal.json` confirma o padrão: cada sessão do Perplexity gerava uma nova versão sem sobrescrever a anterior. Sem versionamento = sem rastreabilidade.

---

## Pastas Principais

### 📁 `techsites-hub-main` (pasta central do projeto)

| Arquivo/Pasta | Tipo | Relevância |
|---|---|---|
| `SYNEX CORE BLUEPRINT - PROTOCOLO DE ATIVAÇÃO MESTRE` | DOCX + PDF | **Nome oficial da IA TechSites = SYNEX** |
| `SYNEX-DEFINICAO-E-DESCRICAO` | DOCX + PDF | Definição e descrição do sistema SYNEX |
| `SYNEX-ESCOPO-PROMPTS-TECHSITES-FINAL` | DOCX + PDF | Prompts finais do escopo TechSites |
| `SYNEX-ESCOPO-PROMPTS-TECHSITES` | PDF | Versão anterior dos prompts |
| `SEO-CONTENT-SONNET-BLUE-PRINT.pdf` | PDF | Blueprint do sistema de SEO Content |
| `Stack Operacional TechSites— GitHub, Cloudflare, n8n e VPS.pdf` | PDF | Documento da stack operacional |
| `→ TEMPLATE-MASTER-ARQUIVOS/` | Pasta | Arquivos do template master (Dubai base) |
| `→ WYSIWYG - BLUEPRINT/` | Pasta | Blueprint completo do editor WYSIWYG |
| `→ seo-content-fase-01/` | Pasta | Fase 1 do projeto SEO Content |
| `→ projeto-seo-content-prompts/` | Pasta | Prompts do projeto SEO |
| `→ projeto-seo-content-prompts-best/` | Pasta | Melhores prompts (curados) |
| `→ perplexity-max-project/` | Pasta | Subpasta do projeto Perplexity |
| `→ ESTRUTURA-INDEX-RECOMENDADA/` | Pasta | Estrutura recomendada de index |

**Descoberta importante:** O sistema tem nome — **SYNEX**. É o nome da IA/automação que orquestra o TechSites. Os blueprints SYNEX são os documentos estratégicos mais relevantes do Drive.

### 📁 `computador-26-06-26` (backup do computador — 26 Jun 2026)

| Arquivo/Pasta | Relevância |
|---|---|
| `domain-mapping-guia-definitivo.docx` | Guia definitivo de mapeamento de domínios |
| `GITHUB-DESKTOP-INSTR.pdf` | Instruções GitHub Desktop |
| `PROJETO-MEDIAGEEK-REPLIT.pdf` | **Briefing do projeto MediaGeek no Replit** |
| `REDE DE PROJETOS AGÊNCIA MEDIAGEEK.IO.pdf` | Mapa da rede de projetos da agência |
| `REDE DE PROJETOS AGÊNCIA MEDIAGEEK.IO.txt` | Versão texto do mapa de projetos |
| `→ TECH-SITES-ARQUIVOS-RESERVA/` | Reserva de arquivos TechSites |
| `→ MEDIA-GEEK/` | Arquivos MediaGeek |
| `→ hostinger-dicas/` | Dicas Hostinger |
| `→ downloads/` | Downloads gerais |
| `→ video-1-musica-infantil/` | Projeto vídeo (fora do escopo) |

### 📁 `ama-cafe-docs`

| Arquivo | Relevância |
|---|---|
| `PROJETO AMA.CAFE.docx` (Dez/2025) | Briefing original do projeto ama.cafe |

### 📁 `PDF-GERAL-TECH SITES`

| Arquivo | Relevância |
|---|---|
| `Arquitetura Enterprise WordPress, Cloud e SaaS_WaaS.pdf` (Jan/2026) | Arquitetura enterprise completa |

### 📁 `perplexity-max-project` (análise de ferramentas)

PDFs documentando **problemas reais com o Perplexity** como ferramenta de execução:

| PDF | O que documenta |
|---|---|
| `perplexity-max-vs-pro-retrabalho.pdf` | Análise do retrabalho gerado |
| `perplexity-max-vs-pro-perda-de-memoria.pdf` | **Documentação da perda de memória entre sessões** |
| `perplexity-max-vs-pro-assumir-projeto-e-corrigir-erros.pdf` | Como retomar e corrigir erros |
| `perplexity-max-vs-pro-tempo-de-execução.pdf` | Análise de tempo de execução |
| `perplexity-max-seo-completo.pdf` | SEO completo via Perplexity |
| `perplexity-max-seo-18-workflow-de-abordagem-email-whats-produto-07.pdf` | Workflow de abordagem comercial |

**Diagnóstico confirmado:** Você já identificou e documentou os problemas com o Perplexity (retrabalho, perda de memória, tempo de execução) em Março de 2026. Os PDFs mostram que esta análise foi feita há 4 meses. A solução (código que persiste) ainda não foi implementada.

### 📁 `arquivos-06-03-2026`

Blueprints técnicos de Fev/2026:

| Arquivo | Relevância |
|---|---|
| `FASE 3 PROJETO TECHSITES NETWORK` (4 versões) | Planejamento da Fase 3 |
| `BLUEPRINT TÉCNICO - PLATAFORMA SEOCONTENT WAAS.docx` | Blueprint SEO Content WaaS |
| `DEFINICAO-DO-NOME-DA-IA-TECHITES.docx` | **Definição do nome da IA** (= SYNEX) |
| `Arquitetura Operacional do Synex.docx` | **Arquitetura operacional SYNEX** |
| `SYNEX CORE BLUEPRINT - PROTOCOLO DE ATIVAÇÃO MESTRE` | Blueprint master |
| `SYNEX-ESCOPO-PROMPTS-TECHSITES-FINAL` | Escopo final de prompts |
| `SEO-CONTENT-SONNET-BLUE-PRINT.pdf` | Blueprint SEO com Sonnet |

---

## O Que NÃO Existe no Drive

| Item Esperado | Status |
|---|---|
| Workflows N8N exportados (`.json`) | ❌ Não existe |
| `listings.json` de nenhuma cidade | ❌ Não existe |
| Configs de site prontas para uso | ❌ Apenas rascunhos/exemplos |
| Assets finais (imagens, logos SVG) | ❌ Não mapeados |
| Schema de dados de directory | ❌ Não existe como código |
| Scripts de build ou automação | ❌ Não existe |

**A única exceção:** o `deploy-pages.yml` é um arquivo de CI/CD real — mas há 2 versões na raiz sem organização clara.

---

## Mapa Completo do Drive (Visual)

```
Google Drive (raiz)
│
├── 📄 action-center-site-factory-minimal.json  (×6 versões)
├── 📄 deploy-pages.yml  (×2 versões)
├── 📄 BLUEPRINT-AUTOMACAO-DIRECTORY-GLOBAL.md
├── 📄 BLUEPRINT-DESCRITIVO-WYSIWYG-STANDALONE-V1-1-1.md
├── 📄 BLUEPRINT-TECNICO-WYSIWYG-STANDALONE-V1-1-1.md
├── 📄 BLUEPRINT-HUB-EDITS.md
├── 📄 DEPLOY-GITHUB-VS-WRANGLER.md
├── 📄 n8n-notification-templates.md  (×2 versões)
├── 📄 prompt-01-workflow-maestro.md
├── 📄 perplexity-bridge.json
├── 📄 PADRAO-REPOSITORIOS-GDRIVE-GITHUB.md
├── 📄 pixelforge-cell-*.zip  (×3 versões)
│
├── 📁 techsites-hub-main/          ← Base de conhecimento central
│   ├── 📄 SYNEX CORE BLUEPRINT (DOCX + PDF)
│   ├── 📄 SYNEX-DEFINICAO-E-DESCRICAO (DOCX + PDF)
│   ├── 📄 SYNEX-ESCOPO-PROMPTS-TECHSITES-FINAL (DOCX + PDF)
│   ├── 📄 SEO-CONTENT-SONNET-BLUE-PRINT.pdf
│   ├── 📄 Stack Operacional TechSites.pdf
│   ├── 📁 TEMPLATE-MASTER-ARQUIVOS/
│   ├── 📁 WYSIWYG - BLUEPRINT/
│   ├── 📁 seo-content-fase-01/
│   ├── 📁 projeto-seo-content-prompts/
│   ├── 📁 projeto-seo-content-prompts-best/
│   └── 📁 ESTRUTURA-INDEX-RECOMENDADA/
│
├── 📁 computador-26-06-26/         ← Backup Jun/2026
│   ├── 📄 PROJETO-MEDIAGEEK-REPLIT.pdf
│   ├── 📄 REDE DE PROJETOS AGÊNCIA MEDIAGEEK.IO.pdf
│   ├── 📄 domain-mapping-guia-definitivo.docx
│   ├── 📁 TECH-SITES-ARQUIVOS-RESERVA/
│   └── 📁 MEDIA-GEEK/
│
├── 📁 ama-cafe-docs/               ← Briefing ama.cafe
│   └── 📄 PROJETO AMA.CAFE.docx
│
├── 📁 PDF-GERAL-TECH SITES/        ← PDFs gerais
│   └── 📄 Arquitetura Enterprise WordPress, Cloud e SaaS_WaaS.pdf
│
├── 📁 perplexity-max-project/      ← Análise de ferramentas
│   ├── 📄 perplexity-max-vs-pro-retrabalho.pdf
│   ├── 📄 perplexity-max-vs-pro-perda-de-memoria.pdf
│   ├── 📄 perplexity-max-vs-pro-tempo-de-execução.pdf
│   └── 📄 perplexity-max-seo-completo.pdf
│
└── 📁 arquivos-06-03-2026/         ← Blueprints Fev/2026
    ├── 📄 FASE 3 PROJETO TECHSITES NETWORK (×4 versões)
    ├── 📄 Arquitetura Operacional do Synex.docx
    └── 📄 BLUEPRINT TÉCNICO - PLATAFORMA SEOCONTENT WAAS.docx
```

---

## Conclusão

### O Drive é uma biblioteca, não uma fábrica

O Drive armazena **o pensamento** (blueprints, decisões, arquiteturas) mas não **a execução** (código, dados, configs operacionais). Isso é intencional — mas cria uma lacuna: sem código, cada sessão de execução começa do zero.

### SYNEX é o ativo intelectual central

Os documentos SYNEX (blueprint, escopo, protocolos) são o ativo mais valioso do Drive. SYNEX é a definição formal do que o sistema TechSites deve fazer. Quando o `engine/build.js` for construído, ele é a implementação técnica do SYNEX.

### A solução para o Drive

O Drive deve continuar como biblioteca de conhecimento, mas precisamos adicionar uma camada de dados operacionais:

```
Drive (atual) = Documentos + Blueprints
Drive (futuro) = Documentos + Blueprints + configs/ + data/listings/
```

Especificamente, criar no Drive:
- `techsites-engine/configs/dubai.fond.coffee.json` — config versionada de cada site
- `techsites-engine/data/dubai.fond.coffee/listings.json` — dados dos listings
- `techsites-engine/exports/n8n-workflows/*.json` — workflows N8N exportados

O `engine/build.js` lerá diretamente do Drive via API, garantindo que qualquer mudança de config seja imediatamente refletida no build.

---

*Auditoria gerada via Replit Google Drive Connector — Julho 2026.*
