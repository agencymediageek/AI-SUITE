# Auditoria Técnica — Ecossistema TechSites.ai
**Data:** Julho de 2026  
**Escopo:** GitHub (reynaldodallin) + Cloudflare + Infraestrutura  
**Objetivo:** Diagnóstico de fragilidade e plano de consolidação

---

## Índice

1. [Mapa do Ecossistema](#mapa)
2. [Diagnóstico de Fragilidade](#fragilidade)
3. [O Problema Central: Visão vs. Realidade](#visao-vs-realidade)
4. [Cloudflare — Estado Atual](#cloudflare)
5. [GitHub — Estado dos Repositórios](#github)
6. [Plano de Consolidação](#plano)
7. [Arquitetura Proposta](#arquitetura)
8. [Prioridade de Execução](#prioridade)

---

## 1. Mapa do Ecossistema {#mapa}

### Domínios Cloudflare (14 ativos)

| Domínio | Propósito | Estado |
|---|---|---|
| `fond.coffee` | Rede global de cafés (EN) | ⚠️ Sem DNS records |
| `places.guide` | Yellow Pages global | ⚠️ Sem DNS records |
| `hq.tips` | Hub/nicho tips | 🔴 WordPress padrão ("Hello world!") |
| `saas.tips` | TechProspect/SaaS | ⚠️ Sem DNS records |
| `waas.host` | WaaS modelo comercial | ⚠️ Sem DNS records |
| `llc.reviews` | Directory corporativo USA | ⚠️ Sem DNS records |
| `cult.tips` | Nicho tips | ⚠️ Sem DNS records |
| `hub.guide` | Hub de directories | ⚠️ Sem DNS records |
| `spots.tips` | Spots/lugares | ⚠️ Sem DNS records |
| `clever.reviews` | Reviews nicho | ⚠️ Sem DNS records |
| `thebest.tips` | Best-of nicho | ⚠️ Sem DNS records |
| `hho.expert` | Produto tech/saúde | ⚠️ Sem DNS records |
| `velorestudio.com.br` | Cliente BR | ⚠️ Sem DNS records |
| `techsites.ai` | Site principal | ✅ Único em produção |

**Cloudflare Pages:** 0 projetos configurados  
**Cloudflare Workers:** 0 scripts ativos  
**Conclusão:** De 14 domínios, apenas 1 está em produção real.

### Repositórios GitHub (16 repos, reynaldodallin)

| Repositório | Tipo | Conteúdo Real |
|---|---|---|
| `directory-factory` | Documentação | MD + JSON schema + 1 HTML (sem código de automação) |
| `template-master-directory` | Template HTML | Dubai Coffee — HTML/CSS funcional |
| `dubai-coffee-rebuild` | Site estático | 30+ páginas HTML individuais |
| `techsites-hub-docs` | Prompts/Docs | Somente MD files (prompts para Perplexity) |
| `techsites-templates` | Templates | 10 nichos HTML: coach, dentist, ecom, fitness, lawyer... |
| `hub-landing` | Landing page | techsites.ai (funcional) |
| `techprospect-site` | Landing page | TechProspect landing |
| `template-lawyer-accountant` | Template | T_BIZ template |
| `dubai-coffee-rebuild-staging` | Staging | Correções do Dubai (pré-deploy) |
| `waas-modelo-comercial-01` | Template | WaaS modelo |
| `techsites-rebuild-v2` | Rebuild | New website |
| `techsites-hub-site` | Hub portal | Portal central |
| `gym-techsites` | Template | Gym niche |
| `Porto---Multipurpose-...` | Template externo | Porto template (não original) |
| `TEMA-PORTO` | Template externo | Porto variation |
| `directory-network-template` | Template | Network template base |

---

## 2. Diagnóstico de Fragilidade {#fragilidade}

### Problema A — Navbar Duplicada 41 Vezes

```
Evidência: grep "nav" /dubai-coffee-rebuild/listing/*.html | wc -l = 41 arquivos
```

O arquivo `index.html` tem 510 linhas. Cada listing tem 270+ linhas. O header completo (navbar + logo + links + hamburger + overlay) está **copiado manualmente em cada arquivo**.

```
Consequência: mudar um item do menu = editar 41 arquivos
              mudar o logo = editar 41 arquivos
              adicionar um link = editar 41 arquivos
```

Este é o motivo exato pelo qual "mudar uma cor quebrava o site". Quando o Perplexity editava, acertava 30 arquivos e esquecia 11. O site ficava inconsistente e parecia quebrado.

### Problema B — CSS: Sistema Misto (Variables + Hardcoded)

```
CSS variables encontradas: 168 usos de var()
Cores hardcoded encontradas: 20+ hex codes distintos
```

Exemplos de cores hardcoded no `style.css`:
```css
#fff, #D4A574, #6F4E37, #3B2314, #2C1A0E, #0F0904,
#C8860A, #4A3224, #F5EDE0, #E8D5BE, #E0BA8E, #1A0F08...
```

O sistema tem `--color-primary` como variável, mas partes do código usam `#D4A574` diretamente. Quando você tenta mudar a cor primária via variável, 70% muda e 30% fica como estava. **Parece bug, mas é falta de arquitetura.**

### Problema C — Sem Build System

Não existe nenhum script que:
- Leia um `config.json`
- Gere as páginas HTML a partir de templates
- Faça deploy automatizado

O processo atual é: **Perplexity edita arquivo por arquivo, manualmente, sem reversão**.

### Problema D — Sem CI/CD Real

```
Cloudflare Pages: 0 projetos
Cloudflare Workers: 0 scripts
GitHub Actions: não encontrado nos repos principais
```

O deploy é manual. Não há pipeline. Uma mudança errada = site quebrado sem reversão automática.

### Problema E — "Fábrica" É Um Prompt, Não Código

O repositório `directory-factory` contém:
```
DIRECTORY-FACTORY-PROJETO-TECNICO.md   ← 80 linhas de arquitetura
DIRECTORY-FACTORY-SYSTEM-PROMPT.md     ← Prompt para o Perplexity
DIRECTORY-FACTORY-CONTINUIDADE.md      ← Como continuar a sessão
directory-config-schema.json            ← Schema JSON (design artifact)
metronic-directory-builder.html         ← 585 linhas de UI (sem backend)
miami-config.json                       ← Config de exemplo
```

**A "fábrica" é um conjunto de prompts para um AI assistant.** Não existe nenhum script de automação, nenhum workflow N8N exportado, nenhum código de geração. A arquitetura está 100% documentada e 0% implementada.

---

## 3. O Problema Central: Visão vs. Realidade {#visao-vs-realidade}

A arquitetura descrita nos documentos é **excelente**:

```
[Metronic Builder] → POST JSON → [N8N] → 11 workflows → [Cloudflare Pages]
```

Com subdivisão clara:
- WF-01: Criar repo GitHub
- WF-02: Inicializar estrutura
- WF-03: Configurar Cloudflare DNS + Pages
- WF-04: Customizar template
- WF-05: Preparar config JSON
- WF-06: Importar listings
- WF-07: Gerar páginas estáticas
- WF-08: Gerar blog SEO
- WF-09: Injetar monetização
- WF-10: Publicar
- WF-11: Arquivar no Drive

O problema: **nenhum desses workflows existe no N8N**. São microtarefas documentadas para o Perplexity executar manualmente, sessão por sessão. Quando a sessão termina, o contexto se perde e o retrabalho começa.

**Isso explica 6 meses de trabalho sem produto consolidado.** Não é falta de ideia — a ideia é boa. É falta de código que persiste entre sessões.

---

## 4. Cloudflare — Estado Atual {#cloudflare}

### O Que Existe
- 14 zonas DNS configuradas (domínios apontando para o Cloudflare)
- Todos no plano Free
- Zero Cloudflare Pages
- Zero Workers

### O Que Falta
- Cloudflare Pages configurado por domínio/subdomínio
- DNS records apontando para os Pages (ou VPS)
- `_redirects` para subdomínios (ex: `dubai.fond.coffee` → pasta `/dubai/`)
- Headers de cache e segurança

### Como Deveria Funcionar
```
github.com/reynaldodallin/fond-coffee-network
        ↓ (GitHub Actions on push)
Cloudflare Pages build
        ↓
dubai.fond.coffee   → servido via Cloudflare Pages
london.fond.coffee  → servido via Cloudflare Pages
curitiba.ama.cafe   → servido via Cloudflare Pages
```

---

## 5. GitHub — Estado dos Repositórios {#github}

### O Que Funciona Bem

**`techsites-templates`** — Este é o ativo mais valioso:
- 10 nichos completos: coach, dentist, ecom, fitness, lawyer, marketing-agency...
- Cada nicho tem: `index.html`, páginas internas, `css/style.css`, `js/main.js`
- Estrutura consistente entre nichos
- Deploy automático via `.github/workflows/deploy.yml` (existe!)

**`dubai-coffee-rebuild`** — Template de directory funcional:
- Design profissional, Lighthouse provavelmente ≥85
- Schema markup implementado (JSON-LD)
- Dark/light mode
- Mapa Leaflet integrado
- **Problema:** não é replicável sem edição manual extensiva

### O Que Precisa Ser Construído

**`directory-factory`** — Precisa sair de documentação para código real:
- Script `build.js` que lê `config.json` e gera HTML
- Partials de componentes (nav, footer, card)
- Pipeline GitHub Actions → Cloudflare Pages

---

## 6. Arquitetura Proposta {#arquitetura}

### Estrutura de Repositório Único (monorepo)

```
github.com/reynaldodallin/directory-engine/
├── engine/
│   ├── build.js              ← Script principal de geração
│   ├── templates/
│   │   ├── partials/
│   │   │   ├── nav.html      ← Navbar (1 arquivo, usado em todos)
│   │   │   ├── footer.html   ← Footer (1 arquivo)
│   │   │   └── card.html     ← Card de listing (1 arquivo)
│   │   ├── index.html        ← Template da home
│   │   ├── listing.html      ← Template de página individual
│   │   └── listings.html     ← Template da listagem
│   └── css/
│       ├── variables.css     ← TODAS as cores como CSS vars
│       └── base.css          ← Estilos sem cor hardcoded
│
├── configs/
│   ├── dubai.fond.coffee.json
│   ├── curitiba.ama.cafe.json
│   └── london.places.guide.json
│
├── data/
│   ├── dubai.fond.coffee/
│   │   └── listings.json     ← Dados de todos os listings
│   └── curitiba.ama.cafe/
│       └── listings.json
│
├── dist/                     ← Gerado automaticamente (não commitado)
│   ├── dubai.fond.coffee/
│   └── curitiba.ama.cafe/
│
└── .github/workflows/
    └── deploy.yml            ← Build + deploy automático no Cloudflare
```

### Como Funciona (Fluxo Real)

```
1. Editar configs/novosite.json (nome, cor, nicho, domínio)
2. git push
3. GitHub Actions roda: node engine/build.js --config novosite
4. Gera dist/novosite/ completo
5. Deploy automático no Cloudflare Pages
6. Subdomínio live em minutos
```

### Mudança de Cor — Antes vs. Depois

**Antes (Perplexity):**
```
Tarefa: mudar cor primária de #D4A574 para #FF6B35
Tempo: 2-4 horas de edição manual
Risco: alto (esquece arquivos, site fica inconsistente)
```

**Depois (engine proposta):**
```json
// configs/dubai.fond.coffee.json
{ "branding": { "primary_color": "#FF6B35" } }
```
```
git push → build automático → deploy em 3 minutos
Risco: zero (templates são imutáveis, só dados mudam)
```

### CSS Variables — Padrão Obrigatório

```css
/* variables.css — único arquivo de cor */
:root {
  --color-primary:    #D4A574;  /* Mudar aqui = muda em todo o site */
  --color-secondary:  #6F4E37;
  --color-bg:         #0F0904;
  --color-text:       #F5EDE0;
  --color-accent:     #C8860A;
  --font-heading:     'Playfair Display', serif;
  --font-body:        'Inter', sans-serif;
}
/* REGRA: Nenhum hex code fora deste arquivo */
```

---

## 7. Plano de Consolidação {#plano}

### Fase 1 — Base Sólida (Semana 1-2)

**1.1 — Extrair componentes do Dubai Coffee (template base)**
- Criar `partials/nav.html` a partir do `index.html`
- Criar `partials/footer.html`
- Criar `partials/card-listing.html`
- Consolidar todas as cores em `variables.css`

**1.2 — Build script (Node.js)**
- Input: `config.json` + `listings.json` + partials
- Output: site estático completo em `dist/`
- Teste: gerar Dubai Coffee automaticamente e comparar com o manual

**1.3 — CI/CD Cloudflare Pages**
- Conectar repo ao Cloudflare Pages
- GitHub Actions: build em cada push, deploy automático
- DNS records: subdomínio → Cloudflare Pages

**Resultado:** Um único site gerado automaticamente, deployado sem intervenção manual.

### Fase 2 — Primeira Replicação (Semana 3)

**2.1 — Gerar `curitiba.ama.cafe`**
- Criar `configs/curitiba.ama.cafe.json` (adaptar do Dubai)
- Gerar listings de cafés de Curitiba via Bright Data
- Push → build automático → live

**2.2 — Gerar `cwb.site`** (Yellow Pages Curitiba)
- Config para nicho mais amplo (não só cafés)
- Validar escala do sistema com mais categorias

**Resultado:** Prova real de que o sistema replica em < 1 dia de trabalho.

### Fase 3 — Escala Internacional (Semana 4+)

**3.1 — N8N Workflows reais**
- WF-01: Bright Data scrape → `listings.json`
- WF-02: Gerar config.json via formulário Metronic
- WF-03: Trigger GitHub Actions → build → deploy
- WF-04: Atualizar DNS Cloudflare via API
- WF-05: Backup automático no Drive

**3.2 — Rede `fond.coffee`**
- `dubai.fond.coffee` → migrado para engine
- `london.fond.coffee` → gerado pela engine
- `tokyo.fond.coffee` → gerado pela engine
- Todos com o mesmo template, dados diferentes

**3.3 — Rede `places.guide`**
- Yellow pages globais
- Múltiplas categorias por cidade

---

## 8. Prioridade de Execução {#prioridade}

### O Que Fazer Primeiro

```
✅ AGORA:    Construir o build.js e extrair componentes
              (isso desbloqueia tudo que vem depois)

✅ SEMANA 1: CI/CD Cloudflare Pages funcionando
              (deploy manual → deploy automático)

✅ SEMANA 2: Primeiro site replicado (curitiba.ama.cafe)
              (prova de conceito do sistema)

✅ SEMANA 3: N8N workflows reais
              (automação end-to-end)

✅ SEMANA 4+: Escala — 10, 50, 100 directories
              (o sistema trabalha, você só aprova)
```

### O Que NÃO Fazer

```
❌ Usar Perplexity para editar HTML file by file
❌ Criar novos sites antes do engine funcionar
❌ Documentar mais sem implementar
❌ Abrir novos domínios sem ter o primeiro replicável
```

---

## Resumo Executivo

**Você tem:** Visão perfeita, domínios valiosos, templates com bom design, arquitetura bem pensada.

**Falta:** Um programa (300 linhas de Node.js) que transforma `config.json` em site completo.

**Por que 6 meses sem consolidar:** O Perplexity executa sessão por sessão sem persistência de código. Cada nova sessão recomeça do zero, criando retrabalho infinito. A solução não é um AI assistant melhor — é ter **código que persiste e que qualquer AI (ou humano) consegue executar de forma determinística**.

**Próximo passo concreto:** Construir o `engine/build.js` com 3 partials (nav, footer, card) e validar gerando o Dubai Coffee automaticamente a partir de um JSON. Esse é o alicerce de todo o ecossistema.

---

*Auditoria gerada após acesso aos repositórios GitHub (reynaldodallin) e Cloudflare — TechSites.ai, Julho 2026.*
