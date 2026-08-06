# WP TechSites — N8N-First Architecture

> **Status:** Implemented August 2026  
> **Author:** Replit Agent  
> **Context:** Pre-investor-demo refactoring to align WP TechSites with the AI Suite's N8N routing pattern.

---

## Overview

WP TechSites is a WordPress SaaS that gives site owners access to AI-powered tools from within the WordPress admin panel. Each tool now routes through N8N workflows hosted on `n8n.xbest.cloud`, falling back to direct GROK API calls when no N8N URL is configured.

This document describes the complete architecture and the reasoning behind every design decision.

---

## The Problem (Before This Refactor)

The original architecture had **15+ individual Express route handlers**, each hardcoded with a direct AI call:

```
POST /api/wp/generate-content   → callGemini(hardcoded prompt)
POST /api/wp/audit/seo          → callGeminiLong(hardcoded prompt)
POST /api/wp/generate-colors    → callGemini(hardcoded prompt)
POST /api/wp/generate-menu      → callGemini(hardcoded prompt)
...
```

**Problems:**
- Adding a new tool required a code change + redeploy
- Changing a prompt required a code change + redeploy
- No per-tool monitoring or analytics
- No retry/backoff on AI failures
- Impossible to A/B test prompts
- All tools coupled — a bug anywhere could break everything

---

## The Solution: N8N-First Unified Endpoint

### Single Execution Endpoint

```
POST /api/wp/execute
X-WP-Site-Key: <apiKey>
Content-Type: application/json

{
  "toolId": "seo-audit",
  "inputs": { "url": "https://meusite.com.br", ... },
  "language": "pt-BR"
}
```

**Response:**
```json
{
  "output": "...",
  "creditsUsed": 10,
  "creditsRemaining": 140,
  "toolId": "seo-audit",
  "toolLabel": "Auditoria SEO",
  "via": "n8n"
}
```

### Routing Decision Tree

```
POST /api/wp/execute
    │
    ├─ requireSiteKey → load site from wp_sites
    ├─ getWpToolById(toolId) → static definition from wp-tools-data.ts
    ├─ site.creditBalance < tool.creditCost → 402
    │
    ├─ SELECT n8n_webhook_url FROM wp_tools_config WHERE id = toolId
    │
    ├─ IF n8nWebhookUrl:
    │     POST to N8N
    │     body: { toolId, inputs, siteKey, siteUrl, siteName, systemPrompt, language }
    │     → N8N workflow returns { text|output|content }
    │     → normalize response
    │
    └─ ELSE (direct AI fallback):
          POST to GROK (api.x.ai)
          systemPrompt from wp-tools-data.ts
          inputs serialized as user message
    │
    ├─ UPDATE wp_sites SET credit_balance -= tool.creditCost
    ├─ INSERT INTO wp_tool_executions (log)
    ├─ UPDATE wp_tools_config SET usage_count += 1
    └─ return { output, creditsUsed, creditsRemaining, via }
```

---

## Components

### 1. `wp-tools-data.ts` — Static Tool Registry

**File:** `artifacts/api-server/src/lib/wp-tools-data.ts`

Defines every tool statically with:
- `id` — URL-safe key (`seo-audit`, `generate-content`, etc.)
- `creditCost` — tokens deducted per execution
- `n8nDefaultPath` — webhook path on `n8n.xbest.cloud` (null = AI direct only)
- `systemPrompt` — instructions sent to AI or passed to N8N as context
- `plan` — minimum plan required

**Why static instead of DB?**  
Tool definitions (prompts, costs, schemas) are code — they belong in version control, reviewed via PRs, and deployed with the API server. N8N URLs are config — they live in the DB (`wp_tools_config`) so admins can change routing without a redeploy.

### 2. `wp_tools_config` Table — Runtime Configuration

```sql
CREATE TABLE wp_tools_config (
  id              TEXT PRIMARY KEY,     -- tool ID
  n8n_webhook_url TEXT,                  -- full N8N webhook URL (null = AI direct)
  usage_count     INTEGER DEFAULT 0,     -- total executions (analytics)
  is_enabled      BOOLEAN DEFAULT true,  -- soft-disable without removing
  updated_at      TIMESTAMP DEFAULT NOW()
);
```

**Seeded at startup** (idempotent, ON CONFLICT DO NOTHING):

| Tool ID | N8N Webhook |
|---------|-------------|
| `seo-audit` | `https://n8n.xbest.cloud/webhook/seocontent-audit` |
| `generate-content` | `https://n8n.xbest.cloud/webhook/seocontent-v4` |
| `chat-editor` | `https://n8n.xbest.cloud/webhook/ts-chat-editor-intake` |

**To add a new N8N route (no deploy needed):**
```sql
INSERT INTO wp_tools_config (id, n8n_webhook_url)
VALUES ('my-new-tool', 'https://n8n.xbest.cloud/webhook/my-workflow')
ON CONFLICT (id) DO UPDATE SET n8n_webhook_url = EXCLUDED.n8n_webhook_url;
```

**To disable a tool temporarily:**
```sql
UPDATE wp_tools_config SET is_enabled = false WHERE id = 'generate-logo';
```

### 3. `POST /api/wp/execute` — The Unified Endpoint

**Auth:** `X-WP-Site-Key` header (same as all WP TechSites endpoints)  
**File:** `artifacts/api-server/src/routes/wp-techsites.ts`

The endpoint handles:
1. Site authentication + credit validation
2. Tool lookup from static registry
3. N8N routing (DB config) or direct AI fallback
4. Credit deduction (atomic SQL update)
5. Usage logging

**Why keep old endpoints too?**  
Backward compatibility with the existing WordPress plugin (v2.x) and dashboard frontend. Old routes call `callGemini()`/`callGeminiLong()` directly. They work. Migrating the frontend to use `POST /wp/execute` is a separate step done per-tool without breaking the demo.

---

## N8N Integration

### What N8N Receives

```json
{
  "toolId": "seo-audit",
  "inputs": {
    "url": "https://meusite.com.br",
    "theme": { "label": "BeTheme", "type": "multipurpose" },
    "plugins": ["yoast-seo", "woocommerce"],
    "posts_count": 42,
    "ssl": true
  },
  "siteKey": "uuid-api-key",
  "siteUrl": "https://meusite.com.br",
  "siteName": "Meu Site",
  "systemPrompt": "Você é um especialista em SEO técnico...",
  "language": "pt-BR"
}
```

### What the API Server Expects Back

N8N can return any of:

```json
{ "text": "conteúdo gerado" }
{ "output": "conteúdo gerado" }
{ "content": "conteúdo gerado" }
{ "result": "conteúdo gerado" }
```

Or any object — it will be `JSON.stringify`'d as the output.

The API server normalizes: `output = data.text || data.output || data.content || data.result || JSON.stringify(data)`

### Existing N8N Workflows Already Connected

| Workflow | Webhook Path | Status |
|----------|-------------|--------|
| SEOContent - SEO Audit V1.0 | `seocontent-audit` | ✅ Active |
| SEOContent - AI Engine V4.0 | `seocontent-v4` | ✅ Active |
| ts-chat-editor-intake | `ts-chat-editor-intake` | ✅ Active |
| ts-credits-purchase | `ts-credits-purchase` | ✅ Active |

---

## Database: Critical Fix — NULL Credits

**Bug:** New accounts in `wp_sites` had `credit_balance = NULL` despite the schema default of `100`. In JavaScript, `null < 5 === true`, so every credit check failed with "Créditos insuficientes" for all new installs.

**Root cause:** The `credit_balance` column was added via `ALTER TABLE ... ADD COLUMN` to an existing table that had rows without the new column populated.

**Fix (idempotent, runs at startup):**
```sql
UPDATE wp_sites SET credit_balance = 150 WHERE credit_balance IS NULL;
```

Also enforced in `POST /api/wp/register` — always sets `creditBalance: 150` explicitly (never relies on DB DEFAULT alone).

---

## Standard Pattern for New SaaS Products

This architecture is now the **standard** for all WP TechSites family SaaS products:

```
┌─────────────────────────────────────────────────────────┐
│                    STANDARD PATTERN                      │
│                                                          │
│  static tools-data.ts   → defines WHAT tools exist      │
│  *_tools_config DB table → defines HOW they route       │
│  POST /api/*/execute    → unified auth+credit+route hub  │
│  N8N workflows          → the actual AI logic lives here │
│  Direct GROK fallback   → always works, zero deps        │
└─────────────────────────────────────────────────────────┘
```

**Benefits:**
- 🚀 Add new tool in N8N → update DB → zero deploy
- 📊 N8N dashboard shows every execution with inputs/outputs
- 🔄 Retry/backoff handled by N8N natively  
- 🧪 A/B test prompts by creating workflow variants
- 🔐 Only the API server touches the DB — N8N is stateless
- 📈 `usage_count` in `*_tools_config` → analytics without extra code

---

## Infrastructure

| Component | Location | Notes |
|-----------|----------|-------|
| API Server | VPS `179.197.229.207`, PM2 `wptechsites-api`, port `3013` | Node.js/Express |
| Database | PostgreSQL `127.0.0.1:5432` db `wptechsites` | local on VPS |
| N8N | `https://n8n.xbest.cloud` | shared VPS N8N instance |
| Dashboard SPA | `/var/www/wptechsites/` | nginx static files |
| Plugin ZIP | `https://wp.techsites.ai/api/plugins/` | served by Express |
| Domain | `wp.techsites.ai` | Cloudflare → nginx |

---

## Testing the New Endpoint

```bash
# Replace <your-api-key> with a real key from wp_sites table
curl -X POST https://wp.techsites.ai/api/wp/execute \
  -H "X-WP-Site-Key: <your-api-key>" \
  -H "Content-Type: application/json" \
  -d '{
    "toolId": "generate-content",
    "inputs": {
      "topic": "Restaurantes em Curitiba",
      "type": "post",
      "tone": "professional"
    },
    "language": "pt-BR"
  }'

# Expected response:
# { "output": "...", "creditsUsed": 5, "creditsRemaining": 145, "via": "n8n" }
```

---

## Migration Roadmap

| Phase | Status | Description |
|-------|--------|-------------|
| 1 — Endpoint | ✅ Done | `POST /wp/execute` live alongside old routes |
| 2 — Fix Credits | ✅ Done | NULL credits fixed at startup |
| 3 — N8N Seeding | ✅ Done | 3 tools seeded with N8N URLs |
| 4 — Frontend (content.tsx) | 🔜 Next | Switch Gerador de Conteúdo to `/wp/execute` |
| 5 — Frontend (seo-audit.tsx) | 🔜 Next | Switch Auditoria SEO to `/wp/execute` |
| 6 — Frontend (all tools) | 🔜 Future | `useWpExecute({ toolId, inputs })` for all pages |
| 7 — New tools via N8N only | 🔜 Future | No new individual routes — all go through execute |
