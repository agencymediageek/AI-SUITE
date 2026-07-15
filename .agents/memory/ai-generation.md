---
name: AI Generation Route
description: How POST /api/ai/generate works and the N8N fallback chain
---

## Route: POST /api/ai/generate
File: artifacts/api-server/src/routes/ai.ts

1. Validates toolId + prompt, checks user token balance
2. If tool has `n8nWebhookUrl` in tools_config table → forwards to N8N webhook
3. Otherwise → calls Gemini 2.0 Flash directly via REST API (needs GEMINI_API_KEY env var)
4. Deducts tokens from user balance
5. Increments tool usageCount in tools_config (upsert)
6. Logs generation to generations table

## Token cost
Defined statically in tools-data.ts per tool (10–100 tokens depending on tool)

## N8N webhook format
POST to n8nWebhookUrl with: { toolId, prompt, extraInputs, systemPrompt, userId }
Expected response: { text: "...", success: true }

## Models available (GET /api/ai/models)
gemini-2.0-flash, gemini-1.5-pro, gpt-4o-mini, gpt-4o, claude-3-haiku
Only gemini-2.0-flash is implemented in direct fallback; others require N8N workflows with respective API keys.
