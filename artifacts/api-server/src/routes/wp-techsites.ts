/**
 * WP TechSites API
 * Routes that the WordPress plugin and customer dashboard call.
 *
 * Auth: POST /api/wp/register → returns apiKey
 *       All other routes → X-WP-Site-Key: <apiKey> header
 */

import { Router } from "express";
import { randomUUID } from "crypto";
import { db } from "@workspace/db";
import { wpSitesTable, wpToolsConfigTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { getWpToolById, WP_N8N_BASE_URL, WP_TOOLS } from "../lib/wp-tools-data.js";

const router = Router();

// ── Ensure tables exist + migrate columns + seed N8N URLs (idempotent) ───────
async function ensureWpSitesTable() {
  // ── wp_sites ─────────────────────────────────────────────────────────────
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS wp_sites (
      id             SERIAL PRIMARY KEY,
      api_key        TEXT UNIQUE NOT NULL,
      site_url       TEXT NOT NULL,
      site_name      TEXT NOT NULL DEFAULT '',
      owner_email    TEXT NOT NULL,
      owner_name     TEXT NOT NULL DEFAULT '',
      credit_balance INTEGER NOT NULL DEFAULT 100,
      is_active      BOOLEAN NOT NULL DEFAULT true,
      plan           TEXT NOT NULL DEFAULT 'trial',
      wp_user        TEXT NOT NULL DEFAULT '',
      wp_app_password TEXT NOT NULL DEFAULT '',
      wp_rest_url    TEXT NOT NULL DEFAULT '',
      created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_seen_at   TIMESTAMPTZ
    )
  `);
  // Migrate existing rows — add columns if table was created before this version
  await db.execute(sql`ALTER TABLE wp_sites ADD COLUMN IF NOT EXISTS wp_user TEXT NOT NULL DEFAULT ''`);
  await db.execute(sql`ALTER TABLE wp_sites ADD COLUMN IF NOT EXISTS wp_app_password TEXT NOT NULL DEFAULT ''`);
  await db.execute(sql`ALTER TABLE wp_sites ADD COLUMN IF NOT EXISTS wp_rest_url TEXT NOT NULL DEFAULT ''`);
  await db.execute(sql`ALTER TABLE wp_sites ADD COLUMN IF NOT EXISTS site_metadata TEXT NOT NULL DEFAULT '{}'`);

  // Task #104 — fix NULL credit_balance so new installs can use tools
  await db.execute(sql`UPDATE wp_sites SET credit_balance = 150 WHERE credit_balance IS NULL`);

  // ── wp_tools_config ───────────────────────────────────────────────────────
  // Per-tool N8N routing table — mirrors tools_config used by AI Suite.
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS wp_tools_config (
      id              TEXT PRIMARY KEY,
      n8n_webhook_url TEXT,
      usage_count     INTEGER NOT NULL DEFAULT 0,
      is_enabled      BOOLEAN NOT NULL DEFAULT true,
      updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  // ── directory_jobs ────────────────────────────────────────────────────────
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS directory_jobs (
      id               TEXT PRIMARY KEY,
      site_key         TEXT NOT NULL,
      status           TEXT NOT NULL DEFAULT 'queued',
      city             TEXT NOT NULL DEFAULT '',
      categories       TEXT NOT NULL DEFAULT '[]',
      batch_queue      TEXT NOT NULL DEFAULT '[]',
      batches_total    INTEGER NOT NULL DEFAULT 0,
      batches_done     INTEGER NOT NULL DEFAULT 0,
      total_requested  INTEGER NOT NULL DEFAULT 0,
      total_scraped    INTEGER NOT NULL DEFAULT 0,
      listings_json    TEXT NOT NULL DEFAULT '[]',
      place_ids_seen   TEXT NOT NULL DEFAULT '[]',
      min_rating       REAL    NOT NULL DEFAULT 0,
      publish_to_wp    BOOLEAN NOT NULL DEFAULT false,
      wp_published     INTEGER NOT NULL DEFAULT 0,
      n8n_exec_id      TEXT,
      error_msg        TEXT,
      created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      started_at       TIMESTAMPTZ,
      completed_at     TIMESTAMPTZ,
      next_batch_at    TIMESTAMPTZ,
      credits_reserved INTEGER NOT NULL DEFAULT 0,
      credits_used     INTEGER NOT NULL DEFAULT 0
    )
  `);

  // Seed N8N webhook URLs for tools that already have workflows on n8n.xbest.cloud.
  // ON CONFLICT DO NOTHING — never overrides admin customization.
  const n8nBase = WP_N8N_BASE_URL;
  for (const tool of WP_TOOLS) {
    if (!tool.n8nDefaultPath) continue;
    await db.execute(sql`
      INSERT INTO wp_tools_config (id, n8n_webhook_url, usage_count, is_enabled, updated_at)
      VALUES (${tool.id}, ${`${n8nBase}/${tool.n8nDefaultPath}`}, 0, true, NOW())
      ON CONFLICT (id) DO NOTHING
    `);
  }
}
ensureWpSitesTable().catch(console.error);

// ── Auth Middleware ───────────────────────────────────────────────────────────
async function requireSiteKey(req: any, res: any, next: any) {
  const key = req.headers["x-wp-site-key"] as string | undefined;
  if (!key) {
    res.status(401).json({ error: "X-WP-Site-Key header required" });
    return;
  }
  const [site] = await db.select().from(wpSitesTable).where(eq(wpSitesTable.apiKey, key)).limit(1);
  if (!site || !site.isActive) {
    res.status(403).json({ error: "Invalid or inactive API key" });
    return;
  }
  // Update last_seen_at
  await db.update(wpSitesTable).set({ lastSeenAt: new Date() }).where(eq(wpSitesTable.id, site.id));
  req.wpSite = site;
  next();
}

// Helper: call AI (Gemini primary → Grok fallback)
async function callGemini(prompt: string): Promise<string> {
  // Try Gemini first (only if key looks valid — Gemini keys start with "AIzaSy")
  const geminiKey = process.env["GEMINI"] || process.env["GOOGLE_API_KEY"];
  if (geminiKey && geminiKey.startsWith("AIzaSy")) {
    for (const model of ["gemini-2.0-flash-exp", "gemini-2.0-flash", "gemini-1.5-flash"]) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
            }),
          }
        );
        const data = (await res.json()) as any;
        // 400/401/403 = bad key — stop trying Gemini models entirely
        if (data?.error?.code === 400 || data?.error?.code === 401 || data?.error?.code === 403) break;
        if (data?.error?.code === 429 || data?.error?.code === 503) continue;
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      } catch { continue; }
    }
  }

  // Fallback: Grok (xAI — OpenAI-compatible)
  const grokKey = process.env["GROK"];
  if (grokKey) {
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${grokKey}` },
      body: JSON.stringify({
        model: "grok-3-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });
    const data = (await res.json()) as any;
    const text = data?.choices?.[0]?.message?.content;
    if (text) return text;
    throw new Error(data?.error?.message || "Grok API error");
  }

  throw new Error("Nenhuma chave de IA configurada (GEMINI ou GROK)");
}

// ── CORS for WP plugin (cross-origin from client's domain) ───────────────────
router.use("/wp", (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, X-WP-Site-Key");
  if (req.method === "OPTIONS") { res.sendStatus(204); return; }
  next();
});

// ─────────────────────────────────────────────────────────────────────────────
// executeWpTool — N8N-first execution engine
//
// Routing decision:
//   1. Query wp_tools_config for a configured N8N webhook URL
//   2. If found → POST to N8N (passes tool inputs + systemPrompt + site context)
//   3. If not found → call GROK directly as fallback
//
// This function is the heart of the unified /wp/execute endpoint and can be
// imported internally by other routes as they migrate to the new pattern.
// ─────────────────────────────────────────────────────────────────────────────
interface WpExecuteOptions {
  toolId: string;
  inputs: Record<string, any>;
  site: any;
  systemPrompt: string;
  language?: string;
}

async function executeWpTool(opts: WpExecuteOptions): Promise<{ output: string; via: "n8n" | "grok" }> {
  const { toolId, inputs, site, systemPrompt, language = "pt-BR" } = opts;

  // 1. Check for N8N webhook URL in wp_tools_config
  let n8nUrl: string | null = null;
  try {
    const [config] = await db
      .select()
      .from(wpToolsConfigTable)
      .where(eq(wpToolsConfigTable.id, toolId))
      .limit(1);
    if (config?.isEnabled && config?.n8nWebhookUrl) {
      n8nUrl = config.n8nWebhookUrl;
    }
  } catch { /* table may not exist yet on very first boot */ }

  if (n8nUrl) {
    try {
      const response = await fetch(n8nUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolId,
          inputs,
          siteKey:      site.apiKey,
          siteUrl:      site.siteUrl,
          siteName:     site.siteName,
          systemPrompt,
          language,
        }),
        signal: AbortSignal.timeout(120_000),
      });

      if (response.ok) {
        // Use text() first — avoids crash if body is empty or non-JSON
        const rawText = await response.text();

        if (rawText && rawText.trim().length > 0) {
          // Try to parse as JSON and extract the text field
          let output = rawText;
          try {
            const data = JSON.parse(rawText) as any;
            // Normalize: workflows can return { text }, { output }, { content }, { result }
            const extracted = data?.text ?? data?.output ?? data?.content ?? data?.result;
            if (extracted !== undefined && extracted !== null) {
              output = typeof extracted === "string" ? extracted : JSON.stringify(extracted);
            }
          } catch { /* not JSON — use rawText as-is */ }
          return { output, via: "n8n" };
        }
        // Empty body from N8N — fall through to GROK (workflow not yet configured)
      }
      // Non-2xx or empty → fall through to GROK fallback (log silently)
    } catch { /* N8N unreachable / timeout — fall through to GROK */ }
  }

  // 2. Fallback: direct GROK call
  const grokKey = process.env["GROK"];
  if (!grokKey) throw new Error("Nenhuma chave de IA configurada (GROK)");

  const inputLines = Object.entries(inputs)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : String(v)}`)
    .join("\n");

  const userMessage = inputLines
    ? `${inputLines}\n\nIdioma de saída: ${language}`
    : `Idioma de saída: ${language}`;

  const grokRes = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${grokKey}` },
    body: JSON.stringify({
      model:    "grok-3-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: userMessage },
      ],
      temperature: 0.7,
      max_tokens:  2048,
    }),
    signal: AbortSignal.timeout(90_000),
  });

  if (!grokRes.ok) {
    const errData = await grokRes.json() as any;
    throw new Error(errData?.error?.message || `GROK error ${grokRes.status}`);
  }

  const grokData = await grokRes.json() as any;
  const output = grokData?.choices?.[0]?.message?.content ?? "";
  return { output, via: "grok" };
}

// ── POST /api/wp/execute — Unified N8N-first tool execution endpoint ──────────
//
// This is the canonical endpoint for all WP TechSites tools going forward.
// Old individual routes (/wp/generate-content, /wp/audit/seo, etc.) remain for
// backward compatibility with the existing plugin + dashboard, but new tools
// and future frontend migrations should use this endpoint exclusively.
//
// See docs/architecture/wp-techsites-n8n-pattern.md for full documentation.
router.post("/wp/execute", requireSiteKey, async (req, res) => {
  try {
    const site    = (req as any).wpSite;
    const { toolId, inputs = {}, language = "pt-BR" } = req.body;

    if (!toolId) {
      res.status(400).json({ error: "toolId é obrigatório" });
      return;
    }

    // Look up tool definition
    const tool = getWpToolById(toolId);
    if (!tool) {
      res.status(404).json({ error: `Ferramenta "${toolId}" não encontrada` });
      return;
    }

    // Check if tool is enabled for the site's plan
    const planRank: Record<string, number> = { trial: 0, starter: 1, pro: 2 };
    if ((planRank[site.plan] ?? 0) < (planRank[tool.plan] ?? 0)) {
      res.status(403).json({
        error: `Esta ferramenta requer o plano "${tool.plan}". Seu plano atual é "${site.plan}".`,
        upgrade_url: "https://wp.techsites.ai/plans",
      });
      return;
    }

    // Credit check (safe against NULL — coerce to 0)
    const balance = site.creditBalance ?? 0;
    if (balance < tool.creditCost) {
      res.status(402).json({
        error: `Créditos insuficientes. Esta ferramenta custa ${tool.creditCost} créditos. Saldo atual: ${balance}.`,
        credits_needed:   tool.creditCost,
        credits_available: balance,
        recharge_url: "https://wp.techsites.ai/credits",
      });
      return;
    }

    // Execute via N8N or direct AI
    const { output, via } = await executeWpTool({
      toolId,
      inputs,
      site,
      systemPrompt: tool.systemPrompt,
      language,
    });

    // Deduct credits atomically
    await db.execute(sql`
      UPDATE wp_sites
      SET credit_balance = GREATEST(0, credit_balance - ${tool.creditCost})
      WHERE id = ${site.id}
    `);

    // Update usage counter (upsert)
    await db.execute(sql`
      INSERT INTO wp_tools_config (id, n8n_webhook_url, usage_count, is_enabled, updated_at)
      VALUES (${toolId}, NULL, 1, true, NOW())
      ON CONFLICT (id) DO UPDATE
        SET usage_count = wp_tools_config.usage_count + 1,
            updated_at  = NOW()
    `);

    const creditsRemaining = Math.max(0, balance - tool.creditCost);

    res.json({
      output,
      creditsUsed:      tool.creditCost,
      creditsRemaining,
      toolId,
      toolLabel:        tool.label,
      via,
    });
  } catch (err: any) {
    req.log?.error(err, "wp/execute error");
    res.status(500).json({ error: err.message || "Erro ao executar ferramenta" });
  }
});

// ── GET /api/wp/plugin-version ────────────────────────────────────────────────
// Returns the latest plugin version so the WP plugin can show an update banner.
router.get("/wp/plugin-version", (_req, res) => {
  res.json({
    latest: "2.7.0",
    download_url: "https://wp.techsites.ai/api/plugins/wp-techsites-plugin-v2.7.0.zip",
    changelog: "Esteira N8N para Popular Diretório: CSV completo com score_marketing+GPS+bairro, modo imediato/background/queue automático, pausa/retoma/cancela, Fase 2 publicação WP separada.",
  });
});

// ── POST /api/wp/register ─────────────────────────────────────────────────────
// Creates a new WP TechSites account and returns an API key.
router.post("/wp/register", async (req, res) => {
  try {
    const { email, name, siteUrl, siteName } = req.body;
    if (!siteUrl) {
      res.status(400).json({ error: "siteUrl é obrigatório" });
      return;
    }

    // Check if site already registered by URL (each WP install = unique account)
    const [existingBySite] = await db
      .select()
      .from(wpSitesTable)
      .where(eq(wpSitesTable.siteUrl, siteUrl.trim()))
      .limit(1);

    if (existingBySite) {
      res.json({
        apiKey: existingBySite.apiKey,
        credits: existingBySite.creditBalance,
        plan: existingBySite.plan,
        message: "Site já registrado — chave recuperada",
      });
      return;
    }

    // Check if email already registered (fallback)
    const [existing] = email ? await db
      .select()
      .from(wpSitesTable)
      .where(eq(wpSitesTable.ownerEmail, email.trim().toLowerCase()))
      .limit(1) : [null];

    if (existing) {
      res.json({
        apiKey: existing.apiKey,
        credits: existing.creditBalance,
        plan: existing.plan,
        message: "Conta já existente — chave recuperada",
      });
      return;
    }

    const apiKey = randomUUID();
    const safeEmail = email ? email.trim().toLowerCase() : `auto-${Date.now()}@wp.techsites.ai`;
    const [site] = await db
      .insert(wpSitesTable)
      .values({
        apiKey,
        siteUrl: siteUrl.trim(),
        siteName: siteName?.trim() || new URL(siteUrl).hostname,
        ownerEmail: safeEmail,
        ownerName: name?.trim() || "",
        creditBalance: 150, // Trial bonus
        plan: "trial",
      })
      .returning();

    res.json({
      apiKey: site.apiKey,
      credits: site.creditBalance,
      plan: site.plan,
      message: "Conta criada! Cole a chave API no plugin WP TechSites.",
    });
  } catch (err: any) {
    req.log?.error(err, "wp/register error");
    res.status(500).json({ error: "Erro ao registrar site" });
  }
});

// ── POST /api/wp/connect-rest ─────────────────────────────────────────────────
// Saves WP REST API credentials so the api-server can write back to WordPress.
router.post("/wp/connect-rest", requireSiteKey, async (req, res) => {
  try {
    const site = (req as any).wpSite;
    const { wp_user, wp_app_password, wp_rest_url } = req.body;

    if (!wp_user || !wp_app_password || !wp_rest_url) {
      res.status(400).json({ error: "wp_user, wp_app_password e wp_rest_url são obrigatórios" });
      return;
    }

    const baseUrl = wp_rest_url.replace(/\/$/, "");
    const auth = Buffer.from(`${wp_user}:${wp_app_password}`).toString("base64");

    // Validate credentials against WP
    const testRes = await fetch(`${baseUrl}/wp/v2/users/me`, {
      headers: { "Authorization": `Basic ${auth}`, "Content-Type": "application/json" },
    });
    const testData = await testRes.json() as any;

    if (!testData.id) {
      res.status(401).json({
        error: "Credenciais inválidas: " + (testData.message || "verifique o usuário e a senha de aplicação"),
      });
      return;
    }

    // Persist to DB
    await db.execute(sql`
      UPDATE wp_sites SET
        wp_user         = ${wp_user},
        wp_app_password = ${wp_app_password},
        wp_rest_url     = ${baseUrl}
      WHERE id = ${site.id}
    `);

    res.json({
      connected: true,
      wp_user: testData.name,
      wp_roles: testData.roles,
      wp_rest_url: baseUrl,
      message: `✅ WordPress conectado como "${testData.name}" — write-back ativo`,
    });
  } catch (err: any) {
    req.log?.error(err, "wp/connect-rest error");
    res.status(500).json({ error: "Erro ao conectar: " + err.message });
  }
});

// ── GET /api/wp/verify ────────────────────────────────────────────────────────
// Plugin calls this on settings save to confirm the key works.
router.get("/wp/verify", requireSiteKey, async (req, res) => {
  const site = (req as any).wpSite;
  res.json({
    connected: true,
    siteName: site.siteName,
    siteUrl: site.siteUrl,
    credits: site.creditBalance,
    plan: site.plan,
    tools: getAvailableTools(site.plan),
  });
});

// ── POST /api/wp/chat ─────────────────────────────────────────────────────────
// Chatbot widget sends messages here.
router.post("/wp/chat", requireSiteKey, async (req, res) => {
  try {
    const site = (req as any).wpSite;
    const { message, siteUrl } = req.body;
    if (!message) { res.status(400).json({ error: "message required" }); return; }
    if (site.creditBalance <= 0) {
      res.json({ reply: "Seu saldo de créditos acabou. Acesse wp.techsites.ai para recarregar." });
      return;
    }

    const prompt = `Você é o assistente de IA do site "${site.siteName || siteUrl}".
Responda de forma útil, concisa e amigável em português.
Se o usuário perguntar sobre serviços, mencione que o site usa WP TechSites para automação com IA.
Mensagem do visitante: "${message}"
Resposta em no máximo 2 parágrafos:`;

    const reply = await callGemini(prompt);

    // Deduct 1 credit
    await db
      .update(wpSitesTable)
      .set({ creditBalance: site.creditBalance - 1 })
      .where(eq(wpSitesTable.id, site.id));

    res.json({ reply: reply.trim() });
  } catch (err: any) {
    req.log?.error(err, "wp/chat error");
    res.status(500).json({ error: "Erro ao processar mensagem" });
  }
});

// ── POST /api/wp/generate-content ────────────────────────────────────────────
// Admin generates content for a page/post.
router.post("/wp/generate-content", requireSiteKey, async (req, res) => {
  try {
    const site = (req as any).wpSite;
    const { topic, type = "page", tone = "professional", language = "pt" } = req.body;
    if (!topic) { res.status(400).json({ error: "topic required" }); return; }
    if (site.creditBalance < 5) {
      res.status(402).json({ error: "Créditos insuficientes. Recarregue em wp.techsites.ai" });
      return;
    }

    const langInstruction = language === "en"
      ? "Write in English."
      : language === "es"
      ? "Escribe en español."
      : "Escreva em português brasileiro.";

    const contentTypeMap: Record<string, string> = {
      post: "um artigo de blog",
      section: "uma seção de página",
      "email-marketing": "um e-mail de marketing (com subject line, preview text, body HTML e CTA claro)",
      social: "posts para redes sociais (Instagram, LinkedIn e Twitter/X com hashtags)",
      ad: "copy de anúncio/vendas (headline, sub-headline, bullets de benefícios e CTA)",
    };
    const contentTypeLabel = contentTypeMap[type] || "uma página";

    const prompt = `Você é um especialista em marketing de conteúdo digital e copywriting.
Crie conteúdo para ${contentTypeLabel} sobre: "${topic}"
Tom: ${tone}. ${langInstruction}
Site/Marca: ${site.siteName || site.siteUrl}

Retorne JSON com este formato exato (nada antes ou depois):
{
  "title": "Título ou subject line atrativo",
  "metaDescription": "Resumo ou preview text de até 155 caracteres",
  "content": "Conteúdo completo em HTML (h2, p, ul, strong) — profissional e pronto para usar",
  "excerpt": "Resumo de 1 parágrafo do conteúdo"
}`;

    const raw = await callGemini(prompt);
    let content: any = {};
    try {
      const match = raw.match(/\{[\s\S]*\}/);
      content = match ? JSON.parse(match[0]) : { title: topic, content: raw, excerpt: "" };
    } catch {
      content = { title: topic, content: raw, excerpt: raw.slice(0, 200) };
    }

    // Deduct 5 credits
    await db
      .update(wpSitesTable)
      .set({ creditBalance: site.creditBalance - 5 })
      .where(eq(wpSitesTable.id, site.id));

    res.json({ ...content, creditsUsed: 5, creditsRemaining: site.creditBalance - 5 });
  } catch (err: any) {
    req.log?.error(err, "wp/generate-content error");
    res.status(500).json({ error: "Erro ao gerar conteúdo" });
  }
});

// ── POST /api/wp/apply-colors ─────────────────────────────────────────────────
// Returns CSS to inject for brand color changes.
router.post("/wp/apply-colors", requireSiteKey, async (req, res) => {
  try {
    const { primaryColor = "#0ea5e9", secondaryColor, style = "modern" } = req.body;

    // Compute contrast color for text on primary
    const sec = secondaryColor || adjustColor(primaryColor, -30);

    const css = `
/* WP TechSites — Brand Colors (${style}) */
:root {
  --wpts-primary: ${primaryColor};
  --wpts-secondary: ${sec};
}
a, a:visited { color: ${primaryColor}; }
a:hover { color: ${sec}; }
.wp-block-button__link,
.button, button[type="submit"],
input[type="submit"] {
  background-color: ${primaryColor} !important;
  border-color: ${primaryColor} !important;
  color: #ffffff !important;
}
.wp-block-button__link:hover,
.button:hover, button[type="submit"]:hover {
  background-color: ${sec} !important;
  border-color: ${sec} !important;
}
h1, h2, h3 { color: ${primaryColor}; }
.site-header, header.site-header { border-top: 3px solid ${primaryColor}; }
`.trim();

    res.json({ css, primaryColor, secondaryColor: sec, creditsUsed: 2 });
  } catch (err: any) {
    req.log?.error(err, "wp/apply-colors error");
    res.status(500).json({ error: "Erro ao gerar CSS" });
  }
});

// ── POST /api/wp/generate-menu ────────────────────────────────────────────────
// Suggests menu structure based on site niche.
router.post("/wp/generate-menu", requireSiteKey, async (req, res) => {
  try {
    const { niche, pages = [], language = "pt" } = req.body;
    const site = (req as any).wpSite;

    const prompt = `Crie uma estrutura de menu de navegação para um site de "${niche || "negócios"}".
${pages.length > 0 ? `Páginas existentes: ${pages.join(", ")}.` : ""}
Retorne JSON com este formato (nada antes ou depois):
{
  "menuItems": [
    {"label": "Início", "slug": "/", "icon": "🏠"},
    {"label": "Serviços", "slug": "/servicos", "icon": "⚡"}
  ]
}
Use emojis únicos por item. Máximo 7 itens. Em ${language === "pt" ? "português" : language === "es" ? "espanhol" : "inglês"}.`;

    const raw = await callGemini(prompt);
    let result: any = { menuItems: [] };
    try {
      const match = raw.match(/\{[\s\S]*\}/);
      result = match ? JSON.parse(match[0]) : result;
    } catch {
      result.menuItems = [
        { label: "Início", slug: "/", icon: "🏠" },
        { label: "Serviços", slug: "/servicos", icon: "⚡" },
        { label: "Sobre", slug: "/sobre", icon: "ℹ️" },
        { label: "Contato", slug: "/contato", icon: "📧" },
      ];
    }

    // Deduct 3 credits
    if (site.creditBalance >= 3) {
      await db
        .update(wpSitesTable)
        .set({ creditBalance: site.creditBalance - 3 })
        .where(eq(wpSitesTable.id, site.id));
    }

    res.json({ ...result, creditsUsed: 3, creditsRemaining: site.creditBalance - 3 });
  } catch (err: any) {
    req.log?.error(err, "wp/generate-menu error");
    res.status(500).json({ error: "Erro ao gerar menu" });
  }
});

// ── POST /api/wp/chatbot ──────────────────────────────────────────────────────
// Alias used by plugin v2.0.0+ frontend chatbot widget (messages[] array style)
router.post("/wp/chatbot", requireSiteKey, async (req, res) => {
  try {
    const site = (req as any).wpSite;
    const { messages = [], siteUrl, prompt: customPrompt, sitePages = [] } = req.body;
    if (!messages.length) { res.status(400).json({ error: "messages required" }); return; }
    if (site.creditBalance <= 0) {
      res.json({ reply: "Seu saldo de créditos acabou. Acesse wp.techsites.ai para recarregar." });
      return;
    }

    // Build site context from pages/posts provided by the plugin frontend
    const pageContext = Array.isArray(sitePages) && sitePages.length
      ? sitePages.map((p: any) => `- **${p.title || "Página"}**: ${p.excerpt || ""} → ${p.link || ""}`).join("\n")
      : "";

    // If no context from frontend, try to fetch it server-side
    let serverContext = "";
    if (!pageContext && siteUrl) {
      serverContext = await fetchSiteContext(siteUrl);
    }

    const siteContext = pageContext || serverContext;

    const history = messages
      .slice(-10)
      .map((m: any) => `${m.role === "user" ? "Visitante" : "Assistente"}: ${m.content}`)
      .join("\n");

    const siteName = site.siteName || siteUrl || "este site";

    const systemPrompt = customPrompt
      ? `${customPrompt}

=== CONTEÚDO REAL DO SITE ===
${siteContext || "(Nenhuma página indexada ainda)"}

=== REGRAS DE RESPOSTA ===
- Responda SEMPRE com base no conteúdo real do site acima.
- Se o visitante perguntar sobre um tópico que existe no site, mencione o link da página: [Ver página](url)
- Se houver uma página ou post relevante, ofereça navegar até ela: "Temos uma página sobre isso: [Nome](url)"
- Se não souber algo, admita honestamente e sugira explorar o site.
- Responda em português de forma natural e amigável.`
      : `Você é o assistente virtual do site **${siteName}**. Seu papel é ajudar visitantes a encontrar o que precisam.

=== CONTEÚDO DO SITE ===
${siteContext || "(Nenhuma página encontrada ainda — responda de forma geral sobre o site)"}

=== REGRAS ===
- Baseie suas respostas no conteúdo real do site acima.
- Quando o visitante perguntar sobre algo que tem no site, mencione o link: [Ver página](url)
- Proponha páginas relevantes proativamente quando fizer sentido.
- Se não tiver certeza sobre algo específico do site, diga que pode ajudar a navegar.
- Responda em português, de forma amigável e útil.`;

    const prompt = `${systemPrompt}\n\n=== HISTÓRICO DA CONVERSA ===\n${history}\n\nAssistente:`;
    const reply = await callGemini(prompt);

    await db.update(wpSitesTable).set({ creditBalance: site.creditBalance - 1 }).where(eq(wpSitesTable.id, site.id));
    res.json({ reply: reply.trim() });
  } catch (err: any) {
    req.log?.error(err, "wp/chatbot error");
    res.status(500).json({ error: "Erro ao processar mensagem" });
  }
});

// ── POST /api/wp/audit/seo ────────────────────────────────────────────────────
// Receives site_data from plugin, returns professional SEO audit with AI.
router.post("/wp/audit/seo", requireSiteKey, async (req, res) => {
  try {
    const site = (req as any).wpSite;
    if (site.creditBalance < 10) {
      res.status(402).json({ error: "Créditos insuficientes. Recarregue em wp.techsites.ai" });
      return;
    }

    // Merge request body with stored site metadata (fallback to DB data when plugin didn't send it)
    const stored = (() => { try { return JSON.parse((site as any).siteMetadata || "{}"); } catch { return {}; } })();
    const siteData = { ...stored, ...req.body };
    const { site_name, site_url, tagline, posts_count, pages_count, permalink, ssl, plugins = [], theme, language, wp_version } = siteData;

    const pluginList = Array.isArray(plugins) ? plugins.slice(0, 15).join(", ") : "";
    const hasYoast    = plugins.includes("wordpress-seo");
    const hasRankMath = plugins.includes("seo-by-rank-math");
    const hasWoo      = plugins.includes("woocommerce");
    const hasCachePl  = plugins.some((p: string) => ["w3-total-cache","wp-super-cache","wp-rocket","litespeed-cache"].includes(p));

    const prompt = `Você é um especialista em SEO técnico. Analise este site WordPress e gere uma auditoria SEO completa.

DADOS DO SITE:
- Nome: ${site_name || "Sem nome"}
- URL: ${site_url || site.siteUrl}
- Tagline: ${tagline || "(vazia)"}
- Posts publicados: ${posts_count || 0}
- Páginas criadas: ${pages_count || 0}
- Estrutura de URLs: ${permalink || "(padrão - ruim para SEO)"}
- SSL/HTTPS: ${ssl ? "Sim" : "Não"}
- Idioma: ${language || "pt-BR"}
- WordPress: ${wp_version || "desconhecido"}
- Tema: ${theme?.label || "desconhecido"} (${theme?.type || "custom"})
- Plugins ativos: ${pluginList || "nenhum"}
- Plugin SEO: ${hasYoast ? "Yoast SEO" : hasRankMath ? "Rank Math" : "NENHUM (crítico!)"}
- WooCommerce: ${hasWoo ? "Sim" : "Não"}
- Plugin de cache: ${hasCachePl ? "Sim" : "Não (recomendado para velocidade)"}

Gere uma auditoria profissional em JSON com este formato EXATO (nada antes ou depois do JSON):
{
  "score": <número 0-100>,
  "grade": "<A|B|C|D>",
  "summary": "<2-3 frases resumindo o diagnóstico>",
  "checks": [
    {"label": "<item verificado>", "status": "<ok|warn|fail|info>", "detail": "<explicação específica>"}
  ],
  "recommendations": ["<recomendação prioritária 1>", "<recomendação 2>", "..."],
  "quick_wins": ["<ação rápida 1>", "<ação rápida 2>"],
  "site_name": "${site_name || site.siteName}",
  "theme": ${JSON.stringify(theme || {})},
  "generated_at": "${new Date().toISOString()}"
}

Inclua pelo menos 10 checks cobrindo: SSL, URL structure, meta description, title tag, content volume, plugin SEO, cache/performance, schema markup, mobile-friendly, link building, heading structure, image optimization.`;

    // N8N-first: usa executeWpTool (roteia via wp_tools_config → N8N → GROK fallback)
    const { output } = await executeWpTool({
      toolId: "seo-audit",
      inputs: { prompt },
      site,
      systemPrompt: "Você é um especialista em SEO técnico para WordPress. Responda APENAS com o JSON solicitado, sem markdown.",
      language: language || "pt-BR",
    });

    let audit: any;
    try {
      const match = output.match(/\{[\s\S]*\}/);
      audit = match ? JSON.parse(match[0]) : null;
    } catch {
      audit = null;
    }

    if (!audit) {
      // Structured fallback
      audit = buildLocalAudit(siteData);
    }

    await db.update(wpSitesTable).set({ creditBalance: Math.max(0, (site.creditBalance ?? 0) - 10) }).where(eq(wpSitesTable.id, site.id));
    res.json({ ...audit, creditsUsed: 10 });
  } catch (err: any) {
    req.log?.error(err, "wp/audit/seo error");
    // Return local audit as fallback
    res.json({ ...buildLocalAudit(req.body), creditsUsed: 0 });
  }
});

// ── POST /api/wp/generate-colors ──────────────────────────────────────────────
// Returns palette suggestions based on niche and style.
router.post("/wp/generate-colors", requireSiteKey, async (req, res) => {
  try {
    const site = (req as any).wpSite;
    const { niche = "negócios", style = "modern" } = req.body;

    const prompt = `Você é um designer especialista em branding digital.
Crie 3 paletas de cores profissionais para um site de "${niche}" com estilo "${style}".

Retorne JSON EXATO (nada antes ou depois):
{
  "palettes": [
    {
      "name": "Nome da Paleta",
      "mood": "Descrição curta do mood",
      "primary": "#hexcolor",
      "secondary": "#hexcolor",
      "accent": "#hexcolor",
      "text": "#hexcolor",
      "background": "#hexcolor"
    }
  ]
}

Cores devem ser contrastantes, acessíveis (WCAG AA) e coerentes com o nicho.`;

    const raw = await callGemini(prompt);
    let result: any;
    try {
      const match = raw.match(/\{[\s\S]*\}/);
      result = match ? JSON.parse(match[0]) : { palettes: getDefaultPalettes(style) };
    } catch {
      result = { palettes: getDefaultPalettes(style) };
    }

    res.json({ ...result, creditsUsed: 2 });
  } catch (err: any) {
    req.log?.error(err, "wp/generate-colors error");
    res.json({ palettes: getDefaultPalettes("modern"), creditsUsed: 0 });
  }
});

// ── POST /api/wp/generate-logo ────────────────────────────────────────────────
// Generates SVG logo using Gemini.
router.post("/wp/generate-logo", requireSiteKey, async (req, res) => {
  try {
    const site = (req as any).wpSite;
    if (site.creditBalance < 15) {
      res.status(402).json({ error: "Créditos insuficientes (15 créditos)" });
      return;
    }

    const { brand_name = site.siteName, style = "modern minimalist", colors = "azul e branco", desc = "" } = req.body;

    const colorMap: Record<string, { primary: string; text: string }> = {
      "azul e branco":       { primary: "#2563eb", text: "#ffffff" },
      "verde e cinza":       { primary: "#16a34a", text: "#ffffff" },
      "roxo e dourado":      { primary: "#7c3aed", text: "#fbbf24" },
      "vermelho e preto":    { primary: "#dc2626", text: "#000000" },
      "laranja e branco":    { primary: "#ea580c", text: "#ffffff" },
      "azul-marinho e dourado": { primary: "#1e3a5f", text: "#fbbf24" },
      "preto e dourado":     { primary: "#000000", text: "#fbbf24" },
      "verde e branco":      { primary: "#15803d", text: "#ffffff" },
    };
    const colorChoice = colorMap[colors] || { primary: "#6366f1", text: "#ffffff" };

    // Generate a professional SVG logo
    const prompt = `Crie um logo SVG profissional para a marca "${brand_name}".
Estilo: ${style}. ${desc ? "Detalhes extras: " + desc : ""}
Cores: primária ${colorChoice.primary}, texto ${colorChoice.text}.

Retorne APENAS o código SVG completo, sem explicações, sem markdown, começando com <svg> e terminando com </svg>.
Requisitos:
- ViewBox: "0 0 300 80" (horizontal, ideal para header de site)
- Inclua um ícone/símbolo à esquerda e o nome da marca à direita
- O ícone deve ser geométrico, simples e profissional
- Use fontes system-ui ou sans-serif
- O logo deve ser claro e legível mesmo em tamanho pequeno
- Nome da marca em destaque: "${brand_name}"`;

    const svg = await callGemini(prompt);
    const svgClean = svg.trim().replace(/^```svg?\n?/, "").replace(/\n?```$/, "").trim();
    const isSvg = svgClean.startsWith("<svg");

    if (!isSvg) {
      // Fallback: generate a clean, minimal SVG programmatically
      const fallbackSvg = generateFallbackSvg(brand_name, colorChoice.primary, colorChoice.text, style);
      res.json({ svg: fallbackSvg, brand_name, style, colors, creditsUsed: 0 });
      return;
    }

    await db.update(wpSitesTable).set({ creditBalance: site.creditBalance - 15 }).where(eq(wpSitesTable.id, site.id));
    res.json({ svg: svgClean, brand_name, style, colors, creditsUsed: 15 });
  } catch (err: any) {
    req.log?.error(err, "wp/generate-logo error");
    const brand_name = req.body?.brand_name || "Logo";
    res.json({ svg: generateFallbackSvg(brand_name, "#6366f1", "#ffffff", "modern"), creditsUsed: 0 });
  }
});

// ── POST /api/wp/scraping/run ─────────────────────────────────────────────────
// Scrapes local businesses via BrightData Google Maps dataset.
router.post("/wp/scraping/run", requireSiteKey, async (req, res) => {
  try {
    const site = (req as any).wpSite;
    const { category = "restaurantes", city = "São Paulo", limit = 20, save_to = "wp", min_rating = 0 } = req.body;
    const actualLimit = Math.min(Number(limit) || 20, 100);

    if (site.creditBalance < 20) {
      res.status(402).json({ error: "Créditos insuficientes (20 créditos por scraping)" });
      return;
    }

    const bdKey = process.env["BRIGHTDATA"];
    let listings: any[] = [];

    if (bdKey) {
      listings = await scrapeBrightData(bdKey, category, city, actualLimit, Number(min_rating));
    }

    // Fallback: generate realistic demo data with Gemini
    if (!listings.length) {
      listings = await generateDemoListings(category, city, actualLimit);
    }

    const cost = Math.min(20 + Math.floor(actualLimit / 10), 50);
    await db.update(wpSitesTable).set({ creditBalance: site.creditBalance - cost }).where(eq(wpSitesTable.id, site.id));

    // ── Push listings directly to WordPress via REST API ──────────────────────
    let wpImported = 0;
    const wpEndpoints: Record<string, number> = {};
    let wpErrors: string[] = [];
    if (save_to === "wp" && site.wpRestUrl && site.wpUser && site.wpAppPassword) {
      for (const listing of listings) {
        try {
          const result = await wpCreateListing(site, {
            title:        listing.name,
            content:      listing.description ? `<p>${listing.description}</p>` : "",
            address:      listing.address      || "",
            phone:        listing.phone        || "",
            website:      listing.website      || "",
            rating:       listing.rating       || null,
            review_count: listing.review_count || 0,
            hours:        listing.hours        || "",
            lat:          listing.lat          || null,
            lng:          listing.lng          || null,
            category:     listing.category     || category,
            source:       listing.source       || "brightdata",
          });
          wpImported++;
          wpEndpoints[result.endpoint] = (wpEndpoints[result.endpoint] || 0) + 1;
        } catch (e: any) {
          wpErrors.push(listing.name + ": " + e.message);
        }
      }
    }

    res.json({
      listings,
      total: listings.length,
      category,
      city,
      save_to,
      creditsUsed: cost,
      creditsRemaining: site.creditBalance - cost,
      source: bdKey ? "brightdata" : "demo",
      ...(save_to === "wp" ? {
        wp_imported:   wpImported,
        wp_endpoints:  wpEndpoints,
        wp_errors:     wpErrors.length ? wpErrors.slice(0, 3) : undefined,
        wp_connected:  !!(site.wpRestUrl && site.wpUser),
      } : {}),
    });
  } catch (err: any) {
    req.log?.error(err, "wp/scraping/run error");
    res.status(500).json({ error: "Erro no scraping: " + err.message });
  }
});

// ── POST /api/wp/chat-editor ──────────────────────────────────────────────────
// Interprets natural language commands → returns WP actions to execute.
router.post("/wp/chat-editor", requireSiteKey, async (req, res) => {
  try {
    const site = (req as any).wpSite;
    const { command, context } = req.body;
    if (!command) { res.status(400).json({ error: "command required" }); return; }

    const prompt = `Você é um assistente inteligente que controla um site WordPress via comandos em linguagem natural.
Site: "${site.siteName}" (${context || site.siteUrl})

Comando do usuário: "${command}"

Interprete o comando e retorne JSON com as ações a executar. Formato EXATO (nada antes ou depois):
{
  "message": "Mensagem amigável confirmando o que foi feito",
  "actions": [
    {
      "type": "<tipo>",
      "value": "<valor principal>",
      "content": "<conteúdo ou URL>",
      "option": "<opção wp opcional>",
      "post_id": null,
      "address": "<endereço se create_listing>",
      "phone": "<telefone se create_listing>",
      "website": "<site se create_listing>",
      "rating": null,
      "category": "<categoria se create_listing>",
      "city": "<cidade se create_listing>"
    }
  ]
}

Tipos de ação disponíveis:
- update_tagline: muda a tagline/slogan do site (value = nova tagline)
- update_site_title: muda o título do site (value = novo título)
- update_option: muda uma opção do WordPress (option = nome da opção, value = novo valor)
- create_post: cria um novo post/artigo (value = título, content = conteúdo HTML rico)
- create_page: cria uma página WordPress com título e conteúdo (value = título da página, content = descrição/assunto — a IA gera HTML rico com hero, cards, CTA)
- create_page_from_url: RASPA uma URL externa e cria página profissional com hero/cards/testemunhos/CTA (value = nome personalizado da página ou vazio, content = URL completa https://...)
- create_listing: cria um listing no diretório (value = nome, address, phone, website, rating, category, city, content = descrição)
- create_directory_page: cria página de diretório com shortcode [wpts_directory] (value = título)
- add_to_menu: adiciona página/post ao menu de navegação principal (post_id = ID se disponível, value = título para busca)
- update_post_title: muda o título de um post (post_id + value)
- update_post_content: muda o conteúdo de um post (post_id + value)

Exemplos:
- "muda a tagline para X" → [{"type":"update_tagline","value":"X"}]
- "adiciona o restaurante Bom Gosto na Rua XV nº 100" → [{"type":"create_listing","value":"Restaurante Bom Gosto","address":"Rua XV de Novembro, 100","category":"restaurantes","city":"Curitiba","rating":4.5}]
- "cria um post sobre turismo em Curitiba" → [{"type":"create_post","value":"Turismo em Curitiba: os melhores pontos turísticos","content":"Artigo sobre os principais atrativos turísticos de Curitiba"}]
- "cria uma página sobre serviços de limpeza" → [{"type":"create_page","value":"Serviços de Limpeza Profissional","content":"Empresa de limpeza residencial e comercial com hero, cards de serviços e depoimentos"}]
- "cria uma página sobre a agência PixelForge do site https://pixelforge.waas.host/ com nome Agência Fiverr e adiciona ao menu" → [{"type":"create_page_from_url","value":"Agência Fiverr","content":"https://pixelforge.waas.host/"},{"type":"add_to_menu"}]
- "raspa o site https://exemplo.com e cria uma página" → [{"type":"create_page_from_url","value":"","content":"https://exemplo.com"}]
- "cria a página do diretório" → [{"type":"create_directory_page","value":"Guia de Curitiba"}]
- "muda o nome do site para Guia CWB" → [{"type":"update_site_title","value":"Guia CWB"}]

Se o comando não for executável com os tipos acima, retorne actions=[] e explique no message.`;

    const raw = await callGemini(prompt);
    let result: any;
    try {
      const match = raw.match(/\{[\s\S]*\}/);
      result = match ? JSON.parse(match[0]) : { message: raw, actions: [] };
    } catch {
      result = { message: "Não consegui interpretar o comando. Tente ser mais específico.", actions: [] };
    }

    // ── Execute actions directly in WordPress if REST is connected ─────────────
    let wpResults: { action: string; success: boolean; post_id?: number; error?: string }[] = [];
    if (site.wpRestUrl && site.wpUser && site.wpAppPassword && result.actions?.length) {
      for (const action of result.actions) {
        try {
          if (action.type === "update_tagline") {
            await wpCall(site, "/wp/v2/settings", "POST", { description: action.value });
            wpResults.push({ action: action.type, success: true });
          } else if (action.type === "update_site_title") {
            await wpCall(site, "/wp/v2/settings", "POST", { title: action.value });
            wpResults.push({ action: action.type, success: true });
          } else if (action.type === "update_option" && action.option) {
            await wpCall(site, "/wp/v2/settings", "POST", { [action.option]: action.value });
            wpResults.push({ action: action.type, success: true });
          } else if (action.type === "create_post") {
            const post = await wpCall(site, "/wp/v2/posts", "POST", {
              title:   action.value,
              content: action.content || "",
              status:  "publish",
            });
            wpResults.push({ action: action.type, success: true, post_id: post.id });
          } else if (action.type === "create_listing") {
            // Smart fallback: plugin endpoint → job_listing CPT → post
            const listing = await wpCreateListing(site, {
              title:    action.value,
              content:  action.content || "",
              address:  action.address  || "",
              phone:    action.phone    || "",
              website:  action.website  || "",
              rating:   action.rating   || null,
              category: action.category || "",
              source:   "chat-editor",
            });
            wpResults.push({ action: action.type, success: true, post_id: listing.id });
          } else if (action.type === "create_page") {
            // Generate rich page HTML via AI then create in WP
            const pagePrompt = `Você é especialista em design de páginas WordPress modernas.
Crie HTML profissional para a página: "${action.value}"
Descrição/contexto: ${action.content || action.value}

Retorne JSON EXATO:
{
  "title": "${action.value}",
  "slug": "slug-da-pagina",
  "content_html": "HTML COMPLETO com: hero com gradiente, 3+ cards de serviços/features, seção de testemunhos (3 depoimentos), CTA final — APENAS inline CSS, responsivo"
}`;
            const pageRaw = await callGeminiLong(pagePrompt);
            const pageMatch = pageRaw.match(/\{[\s\S]*\}/);
            const pageData = pageMatch ? JSON.parse(pageMatch[0]) : null;
            if (!pageData) throw new Error("Não consegui gerar a página");
            const newPage = await wpCall(site, "/wp/v2/pages", "POST", {
              title:   pageData.title || action.value,
              slug:    pageData.slug,
              content: pageData.content_html,
              status:  "publish",
            });
            wpResults.push({ action: action.type, success: true, post_id: newPage.id, url: newPage.link } as any);

          } else if (action.type === "create_page_from_url") {
            // Scrape external URL → rich page with hero/cards/testimonials/CTA
            const targetUrl = (action.content || action.value || "").trim();
            if (!targetUrl.startsWith("http")) throw new Error("URL inválida — forneça uma URL completa (https://...)");
            const customTitle = action.value && !action.value.startsWith("http") ? action.value : "";

            let pageText = "";
            try {
              const fetchRes = await fetch(targetUrl, {
                headers: { "User-Agent": "Mozilla/5.0 (compatible; WPTechSites/2.8)" },
                signal: AbortSignal.timeout(10000),
              });
              const html = await fetchRes.text();
              pageText = html
                .replace(/<script[\s\S]*?<\/script>/gi, "")
                .replace(/<style[\s\S]*?<\/style>/gi, "")
                .replace(/<[^>]+>/g, " ")
                .replace(/\s{3,}/g, "\n")
                .trim()
                .slice(0, 3000);
            } catch { pageText = `Site: ${targetUrl}`; }

            const pfuPrompt = `Você é especialista em design de páginas WordPress modernas.
Analise este site: ${targetUrl}
Conteúdo extraído:
${pageText}

Crie uma página WordPress profissional. ${customTitle ? `Título exato da página: "${customTitle}"` : ""}
Retorne JSON EXATO:
{
  "title": "${customTitle || "Nome extraído do site"}",
  "slug": "slug-da-pagina",
  "meta_description": "SEO em até 155 chars",
  "content_html": "HTML COMPLETO com: hero gradient com título+subtítulo+CTA, 3+ cards de serviços, seção de testemunhos (3 depoimentos), CTA final — APENAS inline CSS, responsivo",
  "excerpt": "Resumo em 1 frase"
}`;
            const pfuRaw = await callGeminiLong(pfuPrompt);
            const pfuMatch = pfuRaw.match(/\{[\s\S]*\}/);
            const pfuData = pfuMatch ? JSON.parse(pfuMatch[0]) : null;
            if (!pfuData) throw new Error("Não consegui gerar a página a partir da URL");

            const fromUrlPage = await wpCall(site, "/wp/v2/pages", "POST", {
              title:   pfuData.title,
              slug:    pfuData.slug,
              content: pfuData.content_html,
              excerpt: pfuData.excerpt || "",
              status:  "publish",
            });

            // Auto-add to menu
            let fromUrlMenu: string | null = null;
            try {
              const mr = await wpCall(site, "/wp-techsites/v1/add-to-menu", "POST", { page_id: fromUrlPage.id });
              fromUrlMenu = mr.menu;
            } catch { /* menu optional */ }

            wpResults.push({ action: action.type, success: true, post_id: fromUrlPage.id, url: fromUrlPage.link, menu: fromUrlMenu } as any);

          } else if (action.type === "add_to_menu") {
            // Find last created page ID from previous actions, or use provided post_id
            const targetId = action.post_id
              || (wpResults.find(r => (r as any).post_id) as any)?.post_id;
            if (!targetId) throw new Error("Nenhuma página encontrada para adicionar ao menu");
            const menuRes = await wpCall(site, "/wp-techsites/v1/add-to-menu", "POST", {
              page_id: targetId,
              menu:    action.value || "",
            });
            wpResults.push({ action: action.type, success: true, menu: menuRes.menu } as any);

          } else if (action.type === "create_directory_page") {
            const page = await wpCall(site, "/wp/v2/pages", "POST", {
              title:   action.value || "Guia de Negócios",
              content: "<!-- wp:shortcode -->[wpts_directory]<!-- /wp:shortcode -->",
              status:  "publish",
            });
            wpResults.push({ action: action.type, success: true, post_id: page.id });
          }
        } catch (e: any) {
          wpResults.push({ action: action.type, success: false, error: e.message });
        }
      }
      if (wpResults.length) {
        const done  = wpResults.filter(r => r.success).length;
        const pages = wpResults.filter(r => (r as any).url).map(r => `\n• ${(r as any).url}`).join("");
        const menus = wpResults.filter(r => (r as any).menu).map(r => ` (adicionado ao menu "${(r as any).menu}")`).join("");
        result.message = `${result.message || ""} — ${done}/${wpResults.length} ação(ões) aplicada(s)${menus}${pages}.`.trim();
      }
    }

    res.json({ ...result, wpResults, creditsUsed: 3 });
  } catch (err: any) {
    req.log?.error(err, "wp/chat-editor error");
    res.status(500).json({ error: "Erro ao processar comando" });
  }
});

// ── GET /api/wp/listings ──────────────────────────────────────────────────────
// Returns current listing count and latest imports from WordPress REST API.
// Tries custom plugin endpoint first; falls back to job_listing CPT, then posts.
router.get("/wp/listings", requireSiteKey, async (req, res) => {
  const site = (req as any).wpSite;
  try {
    if (!site.wpRestUrl || !site.wpUser || !site.wpAppPassword) {
      res.json({ connected: false, total: 0, listings: [], message: "WP REST não conectado" });
      return;
    }

    // 1. Try our custom plugin endpoint (v2.1.0+)
    try {
      const data = await wpCall(site, "/wp-techsites/v1/listings?per_page=10&page=1", "GET");
      res.json({ connected: true, total: data.total || 0, listings: data.listings || [], endpoint: "plugin" });
      return;
    } catch { /* fallthrough */ }

    // 2. Try job_listing CPT (MyListing theme, if REST enabled)
    try {
      const data = await wpCall(site, "/wp/v2/job_listing?per_page=10&status=publish", "GET");
      if (Array.isArray(data)) {
        res.json({ connected: true, total: data.length, listings: data.map((p: any) => ({ id: p.id, title: p.title?.rendered || p.title, link: p.link })), endpoint: "job_listing" });
        return;
      }
    } catch { /* fallthrough */ }

    // 3. Fallback: count all posts (any content imported)
    const posts = await wpCall(site, "/wp/v2/posts?per_page=10&status=publish", "GET");
    const total = Array.isArray(posts) ? posts.length : 0;
    res.json({ connected: true, total, listings: Array.isArray(posts) ? posts.map((p: any) => ({ id: p.id, title: p.title?.rendered || p.title, link: p.link })) : [], endpoint: "posts" });
  } catch (err: any) {
    res.json({ connected: false, total: 0, listings: [], error: err.message });
  }
});

// ── POST /api/wp/demo ─────────────────────────────────────────────────────────
// Live-build demo: generates listings for a city + category and imports to WP.
// Designed for investor demos — returns a rich summary with timing.
router.post("/wp/demo", requireSiteKey, async (req, res) => {
  const site = (req as any).wpSite;
  const startedAt = Date.now();

  try {
    const {
      category    = "restaurantes",
      city        = "Curitiba",
      count       = 5,
      tagline,
      site_title,
    } = req.body;

    const actualCount = Math.min(Number(count) || 5, 15);
    const steps: { step: string; ms: number; ok: boolean; detail?: string }[] = [];
    const t = () => Date.now() - startedAt;

    // ── Step 1: Generate listings ──────────────────────────────────────────
    let listings: any[] = [];
    const bdKey = process.env["BRIGHTDATA"];
    if (bdKey) {
      listings = await scrapeBrightData(bdKey, category, city, actualCount, 0);
    }
    if (!listings.length) {
      listings = await generateDemoListings(category, city, actualCount);
    }
    steps.push({ step: `Gerou ${listings.length} listings de ${category} em ${city}`, ms: t(), ok: listings.length > 0 });

    // ── Step 2: Import listings to WordPress (smart fallback) ─────────────
    let imported = 0;
    const importErrors: string[] = [];
    const importEndpoints: Record<string, number> = {};
    if (site.wpRestUrl && site.wpUser && site.wpAppPassword) {
      for (const listing of listings) {
        try {
          const result = await wpCreateListing(site, {
            title:        listing.name,
            content:      listing.description || "",
            address:      listing.address      || "",
            phone:        listing.phone        || "",
            website:      listing.website      || "",
            rating:       listing.rating       || null,
            review_count: listing.review_count || 0,
            hours:        listing.hours        || "",
            lat:          listing.lat          || null,
            lng:          listing.lng          || null,
            category:     listing.category     || category,
            source:       listing.source       || "demo",
          });
          imported++;
          importEndpoints[result.endpoint] = (importEndpoints[result.endpoint] || 0) + 1;
        } catch (e: any) {
          importErrors.push(listing.name + ": " + e.message);
        }
      }
      const endpointSummary = Object.entries(importEndpoints).map(([k, v]) => `${v} via ${k}`).join(", ");
      steps.push({
        step: `Importou ${imported}/${listings.length} listings para o WordPress${endpointSummary ? ` (${endpointSummary})` : ""}`,
        ms: t(), ok: imported > 0, detail: importErrors[0],
      });
    } else {
      steps.push({ step: "WP REST não conectado — listings não importados", ms: t(), ok: false });
    }

    // ── Step 3: Update tagline ─────────────────────────────────────────────
    const finalTagline = tagline || `O melhor guia de ${city} — ${category} e muito mais`;
    if (site.wpRestUrl && site.wpUser) {
      try {
        await wpCall(site, "/wp/v2/settings", "POST", { description: finalTagline });
        steps.push({ step: `Tagline atualizada: "${finalTagline}"`, ms: t(), ok: true });
      } catch (e: any) {
        steps.push({ step: "Tagline: " + e.message, ms: t(), ok: false });
      }

      // ── Step 4: Update site title if provided ────────────────────────────
      if (site_title) {
        try {
          await wpCall(site, "/wp/v2/settings", "POST", { title: site_title });
          steps.push({ step: `Título do site atualizado: "${site_title}"`, ms: t(), ok: true });
        } catch (e: any) {
          steps.push({ step: "Título: " + e.message, ms: t(), ok: false });
        }
      }
    }

    // ── Step 5: Deduct credits ─────────────────────────────────────────────
    const cost = Math.min(20 + actualCount * 2, 60);
    await db.update(wpSitesTable).set({ creditBalance: Math.max(0, site.creditBalance - cost) }).where(eq(wpSitesTable.id, site.id));
    steps.push({ step: `Créditos debitados: ${cost}`, ms: t(), ok: true });

    const totalMs = Date.now() - startedAt;
    const successSteps = steps.filter(s => s.ok).length;

    res.json({
      success:      imported > 0,
      summary:      `✅ ${imported} listings de "${category}" importados para ${site.siteName} em ${(totalMs / 1000).toFixed(1)}s`,
      category,
      city,
      listings_generated: listings.length,
      listings_imported:  imported,
      tagline:            finalTagline,
      site_url:           site.siteUrl,
      steps,
      total_ms:           totalMs,
      steps_ok:           `${successSteps}/${steps.length}`,
      credits_used:       cost,
      credits_remaining:  Math.max(0, site.creditBalance - cost),
    });
  } catch (err: any) {
    req.log?.error(err, "wp/demo error");
    res.status(500).json({ error: "Erro na demo: " + err.message });
  }
});

// ── POST /api/wp/page-from-url ────────────────────────────────────────────────
// Scrapes a business website URL, extracts info with AI, creates a WP page.
router.post("/wp/page-from-url", requireSiteKey, async (req, res) => {
  const site = (req as any).wpSite;
  try {
    const { url, page_type = "empresa", publish = true } = req.body;
    if (!url) { res.status(400).json({ error: "url é obrigatório" }); return; }

    if (site.creditBalance < 5) {
      res.status(402).json({ error: "Créditos insuficientes (5 créditos)" });
      return;
    }

    // 1. Fetch the URL content
    let pageText = "";
    try {
      const fetchRes = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; WPTechSites/2.1)" },
        signal: AbortSignal.timeout(10000),
      });
      const html = await fetchRes.text();
      // Strip HTML tags, keep meaningful text
      pageText = html
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s{3,}/g, "\n")
        .trim()
        .slice(0, 3000);
    } catch (e: any) {
      pageText = `URL: ${url}`;
    }

    // 2. AI extracts business info and writes the page
    const prompt = `Você é um especialista em design de páginas WordPress modernas.

Analise o conteúdo deste site: ${url}

Conteúdo extraído:
${pageText}

Crie uma página WordPress profissional e moderna para este negócio. Tipo: ${page_type}.

O conteúdo HTML deve incluir obrigatoriamente:
1. HERO SECTION — título impactante, subtítulo, botão CTA (inline styles, gradiente atraente)
2. SOBRE / SERVIÇOS — seção com cards em grid (3 cards mínimo) descrevendo o que fazem
3. TESTEMUNHOS — seção com 3 depoimentos fictícios mas realistas (nomes, foto emoji, texto)
4. CTA FINAL — seção de conversão com botão para entrar em contato/visitar o site
Use APENAS inline CSS (sem classes externas). Design moderno, responsivo, cores coerentes com o negócio.

Retorne JSON EXATO (nada antes ou depois):
{
  "title": "Nome Empresa — Título Atraente da Página",
  "slug": "nome-empresa",
  "meta_description": "Descrição SEO da empresa em até 155 caracteres",
  "content_html": "HTML COMPLETO com hero, cards de serviços, testemunhos e CTA — mínimo 600 palavras de conteúdo real extraído do site. Inline CSS apenas. Responsivo via max-width e flex-wrap.",
  "excerpt": "Resumo em 1 frase poderosa",
  "business_info": {
    "name": "Nome da empresa",
    "phone": "telefone se encontrado ou null",
    "email": "email se encontrado ou null",
    "address": "endereço se encontrado ou null",
    "website": "${url}",
    "category": "categoria do negócio",
    "summary": "descrição em 2 frases"
  }
}`;

    const raw = await callGeminiLong(prompt);
    let pageData: any;
    try {
      const match = raw.match(/\{[\s\S]*\}/);
      pageData = match ? JSON.parse(match[0]) : null;
    } catch { pageData = null; }

    if (!pageData) {
      res.status(500).json({ error: "Não foi possível extrair dados do site" });
      return;
    }

    // 3. Create the page in WordPress
    let wpPage: any = null;
    let menuResult: any = null;
    if (site.wpRestUrl && site.wpUser && site.wpAppPassword) {
      wpPage = await wpCall(site, "/wp/v2/pages", "POST", {
        title:   pageData.title,
        slug:    pageData.slug,
        content: pageData.content_html,
        excerpt: pageData.excerpt || "",
        status:  publish ? "publish" : "draft",
        meta:    { _meta_description: pageData.meta_description || "" },
      });
      // 4. Add page to the first nav menu automatically
      if (wpPage?.id) {
        try {
          menuResult = await wpCall(site, "/wp-techsites/v1/add-to-menu", "POST", { page_id: wpPage.id });
        } catch { /* menu optional */ }
      }
    }

    // Deduct credits
    await db.update(wpSitesTable).set({ creditBalance: Math.max(0, site.creditBalance - 5) }).where(eq(wpSitesTable.id, site.id));

    res.json({
      success: true,
      title:         pageData.title,
      slug:          pageData.slug,
      meta_description: pageData.meta_description,
      business_info: pageData.business_info,
      wp_page_id:    wpPage?.id || null,
      wp_page_url:   wpPage?.link || null,
      menu_added:    menuResult?.menu || null,
      source_url:    url,
      credits_used:  5,
      credits_remaining: Math.max(0, site.creditBalance - 5),
    });
  } catch (err: any) {
    req.log?.error(err, "wp/page-from-url error");
    res.status(500).json({ error: "Erro: " + err.message });
  }
});

// ── POST /api/wp/populate-directory/schedule ─────────────────────────────────
// Smart entry point: immediate (<= 50 listings) or N8N queue job (> 50).
router.post("/wp/populate-directory/schedule", requireSiteKey, async (req, res) => {
  const site = (req as any).wpSite;
  try {
    const {
      city               = "Curitiba",
      categories         = ["restaurantes", "hotéis", "turismo", "serviços", "saúde"],
      count_per_category = 10,
      min_rating         = 0,
      publish_to_wp      = false,
    } = req.body;

    const cats: string[]  = (Array.isArray(categories) ? categories : [categories]).slice(0, 20);
    const countPer        = Math.max(1, Number(count_per_category) || 10);
    const totalRequested  = cats.length * countPer;
    const BATCH_SIZE      = 50;
    const IMMEDIATE_LIMIT = 50;

    // Credit reservation: 20 per category, capped at 400
    const creditCost = Math.min(20 * cats.length * Math.ceil(countPer / BATCH_SIZE), 400);
    if (site.creditBalance < creditCost) {
      res.status(402).json({ error: `Créditos insuficientes (${creditCost} necessários, você tem ${site.creditBalance})` });
      return;
    }

    // ── IMMEDIATE MODE (≤ 50 total) ──────────────────────────────────────────
    if (totalRequested <= IMMEDIATE_LIMIT) {
      const bdKey = process.env["BRIGHTDATA"];
      const allListings: any[] = [];
      const seenIds = new Set<string>();
      const summary: any[] = [];

      for (const category of cats) {
        let listings: any[] = bdKey
          ? await scrapeBrightData(bdKey, category, city, countPer, Number(min_rating))
          : [];
        if (!listings.length) listings = await generateDemoListings(category, city, countPer);

        const source = listings[0]?.source === "brightdata" ? "brightdata" : "demo";
        const unique  = listings.filter(l => { const k = l.place_id || l.name + l.address; if (seenIds.has(k)) return false; seenIds.add(k); return true; });
        const tagged  = unique.map(l => ({ ...l, city, category: l.category || category, scraped_at: new Date().toISOString().split("T")[0] }));
        allListings.push(...tagged);
        summary.push({ category, scraped: tagged.length, source });
      }

      await db.update(wpSitesTable).set({ creditBalance: Math.max(0, site.creditBalance - creditCost) }).where(eq(wpSitesTable.id, site.id));

      return res.json({
        mode:              "immediate",
        success:           true,
        total_scraped:     allListings.length,
        total_requested:   totalRequested,
        city,
        categories:        cats,
        breakdown:         summary,
        csv:               buildCsv(allListings),
        listings_preview:  allListings.slice(0, 5),
        credits_used:      creditCost,
        credits_remaining: Math.max(0, site.creditBalance - creditCost),
      });
    }

    // ── JOB MODE (> 50 total) — create job + trigger N8N ─────────────────────
    const jobId     = randomUUID();
    const batchQueue = generateBatchQueue(cats, city, countPer, BATCH_SIZE);

    await db.execute(sql`
      INSERT INTO directory_jobs
        (id, site_key, status, city, categories, batch_queue, batches_total, batches_done,
         total_requested, total_scraped, listings_json, place_ids_seen, min_rating,
         publish_to_wp, credits_reserved, started_at)
      VALUES
        (${jobId}, ${site.apiKey}, 'queued', ${city}, ${JSON.stringify(cats)},
         ${JSON.stringify(batchQueue)}, ${batchQueue.length}, 0,
         ${totalRequested}, 0, '[]', '[]', ${Number(min_rating)},
         ${publish_to_wp ? true : false}, ${creditCost}, NOW())
    `);

    // Debit credits upfront
    await db.update(wpSitesTable).set({ creditBalance: Math.max(0, site.creditBalance - creditCost) }).where(eq(wpSitesTable.id, site.id));

    // Trigger N8N queue workflow (fire-and-forget)
    const n8nBase = process.env["N8N_BASE_URL"] || "";
    const apiBase = "https://wp.techsites.ai/api";
    if (n8nBase) {
      fetch(`${n8nBase}/webhook/populate-directory-queue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_id: jobId, site_key: site.apiKey, api_base: apiBase }),
        signal: AbortSignal.timeout(8000),
      }).catch(() => {/* non-blocking */});
    }

    const delayMinutes = batchQueue.length <= 5 ? batchQueue.length * 5 : batchQueue.length * 3;
    return res.json({
      mode:              "job",
      success:           true,
      job_id:            jobId,
      batches_total:     batchQueue.length,
      total_requested:   totalRequested,
      estimated_minutes: delayMinutes,
      city,
      categories:        cats,
      credits_used:      creditCost,
      credits_remaining: Math.max(0, site.creditBalance - creditCost),
      message:           `⚡ Esteira iniciada! ${batchQueue.length} lotes agendados para ${totalRequested} listings em ${city}. Tempo estimado: ~${delayMinutes} min.`,
    });
  } catch (err: any) {
    req.log?.error(err, "populate-directory/schedule error");
    res.status(500).json({ error: "Erro: " + err.message });
  }
});

// ── GET /api/wp/jobs/:id/status ───────────────────────────────────────────────
router.get("/wp/jobs/:id/status", requireSiteKey, async (req, res) => {
  const site = (req as any).wpSite;
  try {
    const rows = await db.execute(sql`SELECT * FROM directory_jobs WHERE id = ${req.params["id"]} AND site_key = ${site.apiKey} LIMIT 1`);
    const job  = (rows.rows || [])[0] as any;
    if (!job) { res.status(404).json({ error: "Job não encontrado" }); return; }

    const listings  = safeJsonParse(job.listings_json, []);
    const batchQ    = safeJsonParse(job.batch_queue,   []);
    const done      = Number(job.batches_done);
    const total     = Number(job.batches_total);
    const pct       = total ? Math.round((done / total) * 100) : 0;
    const remaining = batchQ.slice(done);

    res.json({
      job_id:          job.id,
      status:          job.status,
      city:            job.city,
      categories:      safeJsonParse(job.categories, []),
      batches_done:    done,
      batches_total:   total,
      progress_pct:    pct,
      total_requested: Number(job.total_requested),
      total_scraped:   Number(job.total_scraped),
      wp_published:    Number(job.wp_published),
      can_download:    listings.length > 0,
      can_publish:     job.status === "done" && listings.length > 0,
      listings_preview: listings.slice(0, 3),
      next_batch_keyword: remaining[0]?.keyword || null,
      error_msg:       job.error_msg || null,
      created_at:      job.created_at,
      completed_at:    job.completed_at,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/wp/jobs/:id/csv ──────────────────────────────────────────────────
router.get("/wp/jobs/:id/csv", async (req: any, res: any) => {
  // Auth: site_key as query param (for direct browser download link)
  const key = (req.query["site_key"] as string) || req.headers["x-wp-site-key"] as string;
  if (!key) { res.status(401).json({ error: "Autenticação obrigatória" }); return; }
  try {
    const rows = await db.execute(sql`SELECT * FROM directory_jobs WHERE id = ${req.params["id"]} AND site_key = ${key} LIMIT 1`);
    const job  = (rows.rows || [])[0] as any;
    if (!job) { res.status(404).json({ error: "Job não encontrado" }); return; }

    const listings = safeJsonParse(job.listings_json, []);
    const csv      = buildCsv(listings);
    const filename = `listings-${job.city.toLowerCase().replace(/\s+/g, "-")}-${listings.length}-${new Date().toISOString().split("T")[0]}.csv`;

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Cache-Control", "no-cache");
    res.send("\uFEFF" + csv); // BOM for Excel UTF-8
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/wp/jobs/:id/action ──────────────────────────────────────────────
router.post("/wp/jobs/:id/action", requireSiteKey, async (req, res) => {
  const site   = (req as any).wpSite;
  const { action } = req.body as { action: "pause" | "resume" | "cancel" };
  if (!["pause", "resume", "cancel"].includes(action)) { res.status(400).json({ error: "action inválida" }); return; }
  try {
    const newStatus = action === "pause" ? "paused" : action === "cancel" ? "cancelled" : "queued";
    await db.execute(sql`
      UPDATE directory_jobs SET status = ${newStatus}
      WHERE id = ${req.params["id"]} AND site_key = ${site.apiKey}
    `);
    res.json({ ok: true, status: newStatus });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/wp/jobs/:id/publish — Phase 2: publish accumulated listings to WP
router.post("/wp/jobs/:id/publish", requireSiteKey, async (req, res) => {
  const site = (req as any).wpSite;
  try {
    const rows = await db.execute(sql`SELECT * FROM directory_jobs WHERE id = ${req.params["id"]} AND site_key = ${site.apiKey} LIMIT 1`);
    const job  = (rows.rows || [])[0] as any;
    if (!job) { res.status(404).json({ error: "Job não encontrado" }); return; }
    if (job.status !== "done" && Number(job.total_scraped) === 0) {
      res.status(400).json({ error: "Scraping ainda em andamento — aguarde a conclusão" });
      return;
    }

    const listings = safeJsonParse(job.listings_json, []);
    if (!listings.length) { res.status(400).json({ error: "Nenhum listing para publicar" }); return; }

    let published = 0;
    let skipped   = 0;
    for (const l of listings) {
      try {
        await wpCreateListing(site, {
          title: l.name, content: l.description || "", address: l.address || "",
          phone: l.phone || "", website: l.website || "", rating: l.rating || null,
          review_count: l.review_count || 0, hours: l.hours || "",
          lat: l.lat || null, lng: l.lng || null,
          category: l.category || "", source: l.source || "brightdata",
        });
        published++;
      } catch { skipped++; }
    }

    await db.execute(sql`
      UPDATE directory_jobs SET wp_published = ${published}, status = 'done'
      WHERE id = ${req.params["id"]}
    `);

    res.json({
      success:  true,
      published,
      skipped,
      message:  `✅ ${published} listings publicados no WordPress (${skipped} ignorados).`,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── N8N Orchestration endpoints (auth: n8n_secret header or query) ────────────
const N8N_SECRET = process.env["WP_ADMIN_TOKEN"] || "techsites-admin-2026";

function requireN8nSecret(req: any, res: any, next: any) {
  const s = (req.query["n8n_secret"] as string) || req.headers["x-n8n-secret"] as string;
  if (s !== N8N_SECRET) { res.status(401).json({ error: "Unauthorized" }); return; }
  next();
}

// GET /api/wp/jobs/:id/next-batch — N8N fetches the next keyword to process
router.get("/wp/jobs/:id/next-batch", requireN8nSecret, async (req: any, res: any) => {
  try {
    const rows = await db.execute(sql`SELECT * FROM directory_jobs WHERE id = ${req.params["id"]} LIMIT 1`);
    const job  = (rows.rows || [])[0] as any;
    if (!job) { res.json({ done: true }); return; }
    if (job.status === "paused" || job.status === "cancelled") { res.json({ done: true, reason: job.status }); return; }

    const queue  = safeJsonParse(job.batch_queue, []);
    const done   = Number(job.batches_done);
    if (done >= queue.length) {
      // Mark complete
      await db.execute(sql`UPDATE directory_jobs SET status = 'done', completed_at = NOW() WHERE id = ${req.params["id"]}`);
      res.json({ done: true });
      return;
    }

    const batch = queue[done];
    await db.execute(sql`UPDATE directory_jobs SET status = 'running' WHERE id = ${req.params["id"]} AND status = 'queued'`);
    res.json({ done: false, batch, batch_index: done, batches_total: queue.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/wp/jobs/:id/run-batch — N8N triggers BrightData for one batch
router.post("/wp/jobs/:id/run-batch", requireN8nSecret, async (req: any, res: any) => {
  try {
    const rows = await db.execute(sql`SELECT * FROM directory_jobs WHERE id = ${req.params["id"]} LIMIT 1`);
    const job  = (rows.rows || [])[0] as any;
    if (!job) { res.status(404).json({ error: "Job not found" }); return; }
    if (job.status === "paused" || job.status === "cancelled") { res.json({ skipped: true, reason: job.status }); return; }

    const { keyword, category, size = 50 } = req.body;
    const bdKey    = process.env["BRIGHTDATA"];
    const existing = safeJsonParse(job.place_ids_seen, []);
    const seenIds  = new Set<string>(existing);
    const current  = safeJsonParse(job.listings_json, []);

    let fetched: any[] = bdKey
      ? await scrapeBrightData(bdKey, keyword || category, job.city, Number(size), Number(job.min_rating))
      : [];
    if (!fetched.length) fetched = await generateDemoListings(category, job.city, Math.min(Number(size), 12));

    // Deduplicate + tag
    const novel = fetched.filter(l => {
      const k = l.place_id || `${l.name}|${l.address}`;
      if (seenIds.has(k)) return false;
      seenIds.add(k);
      return true;
    }).map(l => ({ ...l, city: job.city, category: l.category || category, scraped_at: new Date().toISOString().split("T")[0] }));

    const merged     = [...current, ...novel];
    const newTotal   = merged.length;
    const newDone    = Number(job.batches_done) + 1;
    const isDone     = newDone >= safeJsonParse(job.batch_queue, []).length;

    await db.execute(sql`
      UPDATE directory_jobs
      SET listings_json   = ${JSON.stringify(merged)},
          place_ids_seen  = ${JSON.stringify([...seenIds])},
          total_scraped   = ${newTotal},
          batches_done    = ${newDone},
          status          = ${isDone ? "done" : "running"},
          completed_at    = ${isDone ? new Date().toISOString() : null}
      WHERE id = ${req.params["id"]}
    `);

    res.json({
      batch_done:    newDone,
      batches_total: safeJsonParse(job.batch_queue, []).length,
      scraped_batch: novel.length,
      total_scraped: newTotal,
      job_done:      isDone,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/wp/article-with-images ─────────────────────────────────────────
// Generates an SEO article with embedded images (Unsplash) and publishes to WP.
router.post("/wp/article-with-images", requireSiteKey, async (req, res) => {
  const site = (req as any).wpSite;
  try {
    const {
      topic,
      city        = "",
      category    = "",
      tone        = "professional",
      word_count  = 600,
      publish     = true,
      image_style = "photography",
    } = req.body;

    if (!topic) { res.status(400).json({ error: "topic é obrigatório" }); return; }
    if (site.creditBalance < 8) { res.status(402).json({ error: "Créditos insuficientes (8 créditos)" }); return; }

    // Build image keywords for Unsplash
    const imgKeywords = [city, category, topic.split(" ").slice(0, 3).join(",")]
      .filter(Boolean).join(",").replace(/\s+/g, "%20");
    const imgBase = `https://images.unsplash.com/photo-`;

    // Curitiba-specific Unsplash photo IDs (high quality, free)
    const curitibaPhotos: Record<string, string> = {
      restaurantes: "1555396273-367ea4eb4db5?w=1200&q=80", // restaurant food
      hotéis:       "1566073771259-5b77d2301b37?w=1200&q=80", // hotel lobby
      turismo:      "1572025442646-b6e17f6f97c5?w=1200&q=80", // city tourism
      serviços:     "1521791136064-7986c2920216?w=1200&q=80", // business services
      saúde:        "1576091160399-112ba8d25d1d?w=1200&q=80", // health clinic
      compras:      "1441986300917-64674bd600d8?w=1200&q=80", // shopping
      default:      "1486325212027-8081e485255e?w=1200&q=80", // city default
    };
    const heroPhotoId = curitibaPhotos[category.toLowerCase()] || curitibaPhotos.default;
    const heroImg = `${imgBase}${heroPhotoId}`;
    const bodyImg  = `${imgBase}1486325212027-8081e485255e?w=800&q=80`;

    const minWords = Math.round(word_count * 0.9);
    const prompt = `Você é um especialista em SEO e marketing de conteúdo digital.

TAREFA: Escreva um artigo SEO profissional sobre o tópico abaixo.

PARÂMETROS OBRIGATÓRIOS:
- Tópico: "${topic}"
${city ? `- Cidade: ${city}` : ""}
${category ? `- Categoria: ${category}` : ""}
- Tom: ${tone}
- Idioma: Português do Brasil (pt-BR)
- Contagem mínima de palavras no campo content_html: ${minWords} palavras (OBRIGATÓRIO — não entregue um texto menor)

ESTRUTURA OBRIGATÓRIA do content_html (não inclua o H1 — ele vira o título do post):
1. Parágrafo de introdução cativante (80-120 palavras)
2. <h2> Seção 1 </h2> + 2 parágrafos densos (cada um 80-100 palavras)
3. <h2> Seção 2 </h2> + 2 parágrafos densos (cada um 80-100 palavras)
4. <h2> Destaques / Dicas </h2> + lista <ul> com 5-7 itens detalhados
5. <h2> Seção 3 </h2> + 2 parágrafos densos (cada um 80-100 palavras)
6. <h2> Conclusão e CTA </h2> + parágrafo final chamando para ação
Total content_html mínimo: ${minWords} palavras. Use linguagem local, específica e rica em detalhes.

RETORNE APENAS este JSON (sem markdown, sem texto antes ou depois):
{
  "title": "Título SEO impactante com palavra-chave (máx 65 chars)",
  "slug": "titulo-seo-url-amigavel",
  "meta_description": "Descrição meta SEO entre 120-155 caracteres exatos",
  "focus_keyword": "palavra-chave principal",
  "content_html": "<h2>...</h2><p>...</p>...(HTML completo — mínimo ${minWords} palavras)",
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "reading_time": ${Math.ceil(word_count / 200)}
}`;

    // N8N-first: gera artigo via workflow (GROK com max_tokens:4096 para ~900 palavras)
    const { output } = await executeWpTool({
      toolId: "article-with-images",
      inputs: { prompt },
      site,
      systemPrompt: "Você é um especialista em SEO e marketing de conteúdo digital. Responda SOMENTE com o JSON solicitado, sem texto adicional, sem markdown.",
      language: "pt-BR",
    });

    let article: any;
    try {
      const match = output.match(/\{[\s\S]*\}/);
      article = match ? JSON.parse(match[0]) : null;
    } catch { article = null; }

    if (!article) { res.status(500).json({ error: "Erro ao gerar artigo" }); return; }

    // Inject hero image at top + mid-article image
    const contentWithImages = `
<figure class="wp-block-image size-large wpts-hero-image">
  <img src="${heroImg}" alt="${topic}" class="wp-image-hero" loading="eager" />
</figure>

${article.content_html}

<figure class="wp-block-image size-medium wpts-mid-image" style="margin:2em 0">
  <img src="${bodyImg}" alt="${category || topic} em ${city || "destaque"}" class="wp-image-body" loading="lazy" />
</figure>`.trim();

    // Publish to WordPress
    let wpPost: any = null;
    if (site.wpRestUrl && site.wpUser && site.wpAppPassword) {
      // Create tags
      const tagIds: number[] = [];
      for (const tag of (article.tags || []).slice(0, 5)) {
        try {
          const tagRes = await wpCall(site, "/wp/v2/tags", "POST", { name: tag });
          if (tagRes.id) tagIds.push(tagRes.id);
        } catch { /* tag may already exist */ }
      }

      wpPost = await wpCall(site, "/wp/v2/posts", "POST", {
        title:   article.title,
        slug:    article.slug,
        content: contentWithImages,
        excerpt: article.meta_description,
        status:  publish ? "publish" : "draft",
        tags:    tagIds,
      });
    }

    await db.update(wpSitesTable).set({ creditBalance: Math.max(0, site.creditBalance - 8) }).where(eq(wpSitesTable.id, site.id));

    res.json({
      success:           true,
      title:             article.title,
      slug:              article.slug,
      meta_description:  article.meta_description,
      focus_keyword:     article.focus_keyword,
      reading_time:      article.reading_time,
      tags:              article.tags,
      hero_image:        heroImg,
      wp_post_id:        wpPost?.id    || null,
      wp_post_url:       wpPost?.link  || null,
      credits_used:      8,
      credits_remaining: Math.max(0, site.creditBalance - 8),
    });
  } catch (err: any) {
    req.log?.error(err, "wp/article-with-images error");
    res.status(500).json({ error: "Erro: " + err.message });
  }
});

// ── POST /api/wp/onboarding ───────────────────────────────────────────────────
// Called by the plugin on first activation or API key save.
// Runs SEO audit, detects theme, stores site metadata.
router.post("/wp/onboarding", requireSiteKey, async (req, res) => {
  const site = (req as any).wpSite;
  try {
    const {
      site_name, site_url, tagline, theme, permalink, ssl,
      wp_version, php_version, language, plugins = [], pages_count = 0, posts_count = 0,
    } = req.body;

    // Update site name/url + persist metadata (theme, plugins) for later use by audit
    await db.update(wpSitesTable).set({
      siteName: site_name || site.siteName,
      siteUrl:  site_url  || site.siteUrl,
      siteMetadata: JSON.stringify({
        theme:       theme || { label: "WordPress", type: "generic" },
        plugins:     plugins || [],
        wp_version:  wp_version || "",
        php_version: php_version || "",
        language:    language || "pt_BR",
        posts_count: posts_count || 0,
        pages_count: pages_count || 0,
        tagline:     tagline || "",
        permalink:   permalink || "/%postname%/",
        ssl:         ssl ?? true,
        updated_at:  new Date().toISOString(),
      }),
    }).where(eq(wpSitesTable.id, site.id));

    // Quick local SEO audit
    const audit = buildLocalAudit({
      site_name:    site_name || site.siteName,
      ssl:          ssl ?? true,
      tagline:      tagline   || "",
      permalink:    permalink || "/%postname%/",
      posts_count:  posts_count,
      pages_count:  pages_count,
      plugins:      plugins,
      theme:        theme     || { label: "WordPress", type: "generic", icon: "🔷" },
      language:     language  || "pt_BR",
      wp_version:   wp_version || "",
    });

    // Detect theme compatibility
    const themeCompatibility = (() => {
      const label = (theme?.label || "").toLowerCase();
      if (label.includes("mylisting") || label.includes("my listing")) return { type: "directory", features: ["job_listing CPT", "reviews", "maps", "custom fields"], score: 10 };
      if (label.includes("betheme") || label.includes("be theme")) return { type: "multipurpose", features: ["visual builder", "one-click demos", "mega menu"], score: 9 };
      if (label.includes("astra") || label.includes("generatepress")) return { type: "lightweight", features: ["fast load", "FSE compatible"], score: 8 };
      return { type: "generic", features: ["standard WP"], score: 6 };
    })();

    // Welcome message via AI
    const welcomeMsg = await callGemini(
      `Gere uma mensagem de boas-vindas personalizada e motivadora (máx 2 frases, em português) para o site "${site_name || site.siteName}" que acabou de instalar o WP TechSites. Tema detectado: ${theme?.label || "WordPress"}. Pontuação SEO inicial: ${audit.score}/100.`
    ).catch(() => `Bem-vindo ao WP TechSites! Seu site ${site_name} está pronto para decolar.`);

    res.json({
      success:              true,
      message:              welcomeMsg,
      site:                 { name: site_name, url: site_url, theme, wp_version, ssl, language },
      seo_audit:            audit,
      theme_compatibility:  themeCompatibility,
      onboarding_complete:  true,
      next_steps: [
        audit.score < 60 ? "🔴 Corrija os problemas de SEO detectados" : "✅ SEO básico em ordem",
        "📁 Configure o Directory Builder e importe os primeiros listings",
        "🎨 Personalize a identidade visual do site",
        "💬 Ative o Chatbot para atendimento 24/7",
        "🔗 Conecte a WordPress REST API para automação completa",
      ],
      credits_remaining: site.creditBalance,
    });
  } catch (err: any) {
    req.log?.error(err, "wp/onboarding error");
    res.status(500).json({ error: "Erro no onboarding: " + err.message });
  }
});

// ── GET /api/wp/tools ─────────────────────────────────────────────────────────
// ── GET /api/wp/admin/sites ───────────────────────────────────────────────────
// Admin panel: list all registered wp_sites. Protected by WP_ADMIN_TOKEN header.
router.get("/wp/admin/sites", async (req: any, res: any) => {
  const token = req.headers["x-admin-token"] as string | undefined;
  const expected = process.env["WP_ADMIN_TOKEN"] || "techsites-admin-2026";
  if (!token || token !== expected) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const sites = await db.select().from(wpSitesTable).orderBy(sql`created_at DESC`);
    return res.json(sites.map((s: any) => ({
      id: s.id,
      apiKey: s.apiKey,
      siteName: s.siteName,
      siteUrl: s.siteUrl,
      ownerEmail: s.ownerEmail,
      ownerName: s.ownerName,
      plan: s.plan,
      credits: s.creditBalance,
      isActive: s.isActive,
      wpConnected: !!(s.wpRestUrl),
      createdAt: s.createdAt,
      lastSeenAt: s.lastSeenAt,
    })));
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to list sites" });
  }
});

// ── PATCH /api/wp/admin/sites/:id ─────────────────────────────────────────────
// Admin: update credits or plan for a site.
router.patch("/wp/admin/sites/:id", async (req: any, res: any) => {
  const token = req.headers["x-admin-token"] as string | undefined;
  const expected = process.env["WP_ADMIN_TOKEN"] || "techsites-admin-2026";
  if (!token || token !== expected) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const id = Number(req.params["id"]);
    const { credits, plan, isActive } = req.body;
    const updates: Record<string, any> = {};
    if (credits !== undefined) updates.creditBalance = Number(credits);
    if (plan !== undefined) updates.plan = plan;
    if (isActive !== undefined) updates.isActive = Boolean(isActive);
    if (!Object.keys(updates).length) return res.status(400).json({ error: "Nothing to update" });
    await db.update(wpSitesTable).set(updates).where(eq(wpSitesTable.id, id));
    return res.json({ ok: true });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to update site" });
  }
});

router.get("/wp/tools", requireSiteKey, async (req, res) => {
  const site = (req as any).wpSite;
  res.json({ tools: getAvailableTools(site.plan), credits: site.creditBalance });
});

// ── GET /api/wp/dashboard ─────────────────────────────────────────────────────
// Dashboard data for the wp.techsites.ai customer panel.
router.get("/wp/dashboard", requireSiteKey, async (req, res) => {
  const site = (req as any).wpSite;
  const meta = parseSiteMetadata(site.siteMetadata);
  const { siteType, themeName } = detectSiteType(meta);
  res.json({
    site: {
      id: site.id,
      siteName: site.siteName,
      siteUrl: site.siteUrl,
      ownerEmail: site.ownerEmail,
      ownerName: site.ownerName,
      plan: site.plan,
      credits: site.creditBalance,
      connectedAt: site.createdAt,
      lastSeen: site.lastSeenAt,
      siteType,
      themeName,
    },
    tools: getAvailableTools(site.plan),
    usageTip: "Cada ação consome créditos. Recarregue a qualquer momento.",
  });
});

// ── Helpers: site-type detection ──────────────────────────────────────────────
function parseSiteMetadata(raw: string | null | undefined): Record<string, any> {
  try { return JSON.parse(raw || "{}"); } catch { return {}; }
}

function detectSiteType(meta: Record<string, any>): { siteType: "directory" | "standard"; themeName: string } {
  // meta.theme can be a plain string (legacy) OR the structured object from
  // wpts_detect_theme() in theme-detector.php: { slug, label, type, activeTemplate, ... }
  const rawTheme = meta?.theme;

  let themeSlug     = "";   // e.g. "betheme", "mylisting"
  let themeLabel    = "";   // e.g. "BeTheme", "MyListing"
  let themeType     = "";   // "directory" | "multipurpose" | "page-builder" | "custom"
  let activeTpl     = "";   // BeTheme active template slug, e.g. "bedirectory"

  if (typeof rawTheme === "string") {
    themeSlug  = rawTheme.toLowerCase().replace(/[\s_]+/g, "-");
    themeLabel = rawTheme;
  } else if (rawTheme && typeof rawTheme === "object") {
    themeSlug  = typeof rawTheme.slug  === "string" ? rawTheme.slug.toLowerCase()  : "";
    themeLabel = typeof rawTheme.label === "string" ? rawTheme.label
               : typeof rawTheme.name  === "string" ? rawTheme.name : "";
    themeType  = typeof rawTheme.type  === "string" ? rawTheme.type.toLowerCase()  : "";
    activeTpl  = typeof rawTheme.activeTemplate === "string"
               ? rawTheme.activeTemplate.toLowerCase() : "";
  }

  // Plugins list: may be "folder/file.php" paths or plain folder names
  const rawPlugins = meta?.plugins;
  const plugins: string[] = Array.isArray(rawPlugins)
    ? rawPlugins.filter((p: any) => typeof p === "string").map((p: string) => p.toLowerCase())
    : [];

  // Known pure-directory theme slugs (these themes ONLY do directories)
  const directoryThemes  = [
    "my-listing", "mylisting", "listingpro", "listing-pro",
    "listify", "listivo", "houzez", "findkit",
    "geodirectory", "directory-starter", "listdom",
    "listable", "jobster",
  ];

  // Directory-specific plugins (slug or path fragment)
  const directoryPlugins = [
    "directorist", "geodirectory", "business-directory-plugin",
    "listdom", "geo-directory", "wp-listings", "listify",
    "wp-job-manager",  // used by Listify / directory sites
  ];

  // BeTheme active templates that indicate a directory site
  // (BeTheme has 700+ templates — we only flag the explicitly directory-style ones)
  const directoryBeThemeTemplates = [
    "directory", "listing", "listings", "bedirectory",
    "real-estate", "realestate", "hotel", "restaurants",
    "travel", "cars", "jobs", "classified",
  ];

  const isDirectory =
    // 1. Plugin already classified the theme as "directory" (e.g. MyListing child theme)
    themeType === "directory" ||
    // 2. Known directory theme slug
    directoryThemes.some(t => themeSlug.includes(t)) ||
    // 3. BeTheme (or other multipurpose) with a directory-style active template
    directoryBeThemeTemplates.some(t => activeTpl.includes(t)) ||
    // 4. Directory plugin installed
    plugins.some(p => directoryPlugins.some(dp => p.includes(dp)));

  return {
    siteType:  isDirectory ? "directory" : "standard",
    themeName: themeLabel || (typeof rawTheme === "string" && rawTheme ? rawTheme : "Padrão"),
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function getAvailableTools(plan: string) {
  const all = [
    { id: "chatbot",          name: "Chatbot IA",           icon: "💬", credits: 1,  available: true },
    { id: "generate-content", name: "Gerador de Conteúdo",  icon: "✍️", credits: 5,  available: true },
    { id: "apply-colors",     name: "Identidade Visual",    icon: "🎨", credits: 2,  available: true },
    { id: "generate-menu",    name: "Estrutura de Menu",     icon: "📋", credits: 3,  available: true },
    { id: "seo-audit",        name: "Auditoria SEO",         icon: "🔍", credits: 10, available: plan !== "trial" },
    { id: "ad-campaign",      name: "Campanha Publicitária", icon: "📣", credits: 15, available: plan === "pro" },
    { id: "listing-builder",  name: "Criador de Directory",  icon: "🗂️", credits: 20, available: plan === "pro" },
  ];
  return all;
}

// ── WP REST API helper ────────────────────────────────────────────────────────
async function wpCall(site: any, path: string, method = "GET", body?: any): Promise<any> {
  if (!site.wpRestUrl || !site.wpUser || !site.wpAppPassword) {
    throw new Error("WP REST não configurado. Configure em Configurações → Conectar WordPress.");
  }
  const url = `${site.wpRestUrl}${path}`;
  const auth = Buffer.from(`${site.wpUser}:${site.wpAppPassword}`).toString("base64");
  const res = await fetch(url, {
    method,
    headers: { "Authorization": `Basic ${auth}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json() as any;
  if (!res.ok) throw new Error(data?.message || `WP REST error ${res.status} at ${path}`);
  return data;
}

// ── Smart listing creator: plugin REST → wpts_listing CPT → rich post fallback ─
async function wpCreateListing(site: any, listing: {
  title: string; content?: string; address?: string; phone?: string; website?: string;
  rating?: number | null; review_count?: number; hours?: string; lat?: number | null;
  lng?: number | null; category?: string; city?: string; source?: string;
  photo_url?: string; summary?: string; place_id?: string;
}): Promise<{ id: number; endpoint: string }> {

  // 1. Try plugin custom REST endpoint (v2.7.0+) — creates proper wpts_listing CPT
  try {
    const r = await wpCall(site, "/wp-techsites/v1/listings", "POST", listing);
    return { id: r.id, endpoint: "plugin" };
  } catch { /* fallthrough */ }

  // 2. Try wpts_listing CPT via standard WP REST (show_in_rest: true in CPT registration)
  try {
    const r = await wpCall(site, "/wp/v2/wpts_listing", "POST", {
      title:   listing.title,
      content: listing.content || "",
      excerpt: listing.summary || "",
      status:  "publish",
      meta: {
        wpts_address:   listing.address      || "",
        wpts_phone:     listing.phone        || "",
        wpts_website:   listing.website      || "",
        wpts_rating:    String(listing.rating   ?? ""),
        wpts_reviews:   String(listing.review_count ?? ""),
        wpts_hours:     listing.hours        || "",
        wpts_lat:       String(listing.lat   ?? ""),
        wpts_lng:       String(listing.lng   ?? ""),
        wpts_source:    listing.source       || "import",
      },
    });
    return { id: r.id, endpoint: "wpts_listing_rest" };
  } catch { /* fallthrough */ }

  // 3. Fallback: rich post with full HTML (Google Maps embed, hours table, CTA buttons)
  const googleMapsUrl = (listing.lat && listing.lng)
    ? `https://www.google.com/maps?q=${listing.lat},${listing.lng}&z=15`
    : listing.address
      ? `https://www.google.com/maps/search/${encodeURIComponent(listing.address)}`
      : null;

  const mapEmbed = (listing.lat && listing.lng)
    ? `<div style="margin:24px 0;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.1)">
  <iframe src="https://maps.google.com/maps?q=${listing.lat},${listing.lng}&z=15&output=embed"
    width="100%" height="280" style="border:0;display:block" loading="lazy"
    allowfullscreen referrerpolicy="no-referrer-when-downgrade"></iframe>
</div>` : "";

  const hoursRows = listing.hours
    ? listing.hours.split(/[,;]/).map(h => `<tr><td style="padding:6px 12px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#374151">${h.trim()}</td></tr>`).join("")
    : "";

  const hoursHtml = hoursRows ? `
<div style="margin:24px 0">
  <h3 style="font-size:16px;font-weight:700;margin:0 0 12px;color:#1e293b">🕐 Horários de Funcionamento</h3>
  <table style="width:100%;border-collapse:collapse;background:#f8fafc;border-radius:10px;overflow:hidden">${hoursRows}</table>
</div>` : "";

  const starRating = listing.rating
    ? `<div style="color:#f59e0b;font-size:18px;font-weight:700;margin-top:10px">
    ${"★".repeat(Math.round(Number(listing.rating)))}${"☆".repeat(5 - Math.round(Number(listing.rating)))}
    <span style="color:#64748b;font-size:14px;font-weight:400">${listing.rating}/5 (${listing.review_count || 0} avaliações)</span>
  </div>` : "";

  const content = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:820px;margin:0 auto">

  <!-- Hero -->
  <div style="background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);border-radius:16px;padding:36px 32px;color:#fff;margin-bottom:28px">
    <h1 style="margin:0 0 6px;font-size:26px;font-weight:800">${listing.title}</h1>
    ${listing.category ? `<span style="background:rgba(255,255,255,.2);border-radius:20px;padding:4px 14px;font-size:12px;font-weight:700;letter-spacing:.5px;text-transform:uppercase">${listing.category}</span>` : ""}
    ${starRating}
  </div>

  <!-- Description -->
  ${listing.content ? `<p style="font-size:15px;line-height:1.75;color:#374151;margin-bottom:24px">${listing.content}</p>` : ""}

  <!-- Info Cards -->
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px;margin-bottom:28px">
    ${listing.address ? `<div style="background:#f8fafc;border-radius:12px;padding:16px"><div style="font-size:22px;margin-bottom:6px">📍</div><div style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">Endereço</div><div style="font-size:13px;color:#1e293b">${listing.address}</div></div>` : ""}
    ${listing.phone ? `<div style="background:#f8fafc;border-radius:12px;padding:16px"><div style="font-size:22px;margin-bottom:6px">📞</div><div style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">Telefone</div><div style="font-size:13px;color:#1e293b">${listing.phone}</div></div>` : ""}
    ${listing.website ? `<div style="background:#f8fafc;border-radius:12px;padding:16px"><div style="font-size:22px;margin-bottom:6px">🌐</div><div style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">Website</div><a href="${listing.website}" target="_blank" style="font-size:13px;color:#6366f1;word-break:break-all">${listing.website.replace(/^https?:\/\//, "")}</a></div>` : ""}
  </div>

  <!-- CTA Buttons -->
  <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:28px">
    ${listing.phone ? `<a href="tel:${listing.phone}" style="background:#22c55e;color:#fff;padding:12px 22px;border-radius:10px;font-weight:700;text-decoration:none;font-size:14px;display:inline-flex;align-items:center;gap:6px">📞 Ligar Agora</a>` : ""}
    ${googleMapsUrl ? `<a href="${googleMapsUrl}" target="_blank" rel="noopener" style="background:#6366f1;color:#fff;padding:12px 22px;border-radius:10px;font-weight:700;text-decoration:none;font-size:14px;display:inline-flex;align-items:center;gap:6px">📍 Ver no Mapa</a>` : ""}
    ${listing.website ? `<a href="${listing.website}" target="_blank" rel="noopener" style="background:#0f172a;color:#fff;padding:12px 22px;border-radius:10px;font-weight:700;text-decoration:none;font-size:14px;display:inline-flex;align-items:center;gap:6px">🌐 Visitar Site</a>` : ""}
  </div>

  ${hoursHtml}
  ${mapEmbed}
</div>`.trim();

  const r = await wpCall(site, "/wp/v2/posts", "POST", {
    title:   listing.title,
    content,
    status:  "publish",
    meta:    { _import_source: listing.source || "import" },
  });
  return { id: r.id, endpoint: "post_rich" };
}

// ── Fetch site pages/posts for chatbot context ────────────────────────────────
async function fetchSiteContext(siteUrl: string): Promise<string> {
  try {
    const base = siteUrl.replace(/\/$/, "");
    const [pagesRaw, postsRaw] = await Promise.all([
      fetch(`${base}/wp-json/wp/v2/pages?per_page=20&status=publish&_fields=title,excerpt,link`, { signal: AbortSignal.timeout(5000) }).then(r => r.ok ? r.json() : []).catch(() => []),
      fetch(`${base}/wp-json/wp/v2/posts?per_page=20&status=publish&_fields=title,excerpt,link`,  { signal: AbortSignal.timeout(5000) }).then(r => r.ok ? r.json() : []).catch(() => []),
    ]);
    const pages = Array.isArray(pagesRaw) ? pagesRaw : [];
    const posts = Array.isArray(postsRaw) ? postsRaw : [];
    const fmt = (items: any[], type: string) =>
      items.map((p: any) =>
        `- [${type}] ${(p.title?.rendered || "").replace(/<[^>]+>/g, "")}: ${(p.excerpt?.rendered || "").replace(/<[^>]+>/g, "").trim().slice(0, 180)} → ${p.link || ""}`
      ).join("\n");
    return `${fmt(pages, "Página")}\n${fmt(posts, "Post")}`.trim();
  } catch {
    return "";
  }
}

// ── Extended AI call (more tokens for audit/scraping) ────────────────────────
async function callGeminiLong(prompt: string): Promise<string> {
  // Try Gemini with higher token limit (only if key looks valid — Gemini keys start with "AIzaSy")
  const geminiKey = process.env["GEMINI"] || process.env["GOOGLE_API_KEY"];
  if (geminiKey && geminiKey.startsWith("AIzaSy")) {
    for (const model of ["gemini-2.0-flash-exp", "gemini-2.0-flash", "gemini-1.5-flash"]) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.5, maxOutputTokens: 2048 },
            }),
          }
        );
        const data = (await res.json()) as any;
        // 400/401/403 = bad key — stop trying Gemini models entirely
        if (data?.error?.code === 400 || data?.error?.code === 401 || data?.error?.code === 403) break;
        if (data?.error?.code === 429 || data?.error?.code === 503) continue;
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      } catch { continue; }
    }
  }

  // Fallback: Grok
  const grokKey = process.env["GROK"];
  if (grokKey) {
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${grokKey}` },
      body: JSON.stringify({
        model: "grok-3-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
        max_tokens: 2048,
      }),
    });
    const data = (await res.json()) as any;
    const text = data?.choices?.[0]?.message?.content;
    if (text) return text;
  }

  throw new Error("Nenhuma chave de IA disponível");
}

// ── Local SEO audit fallback ───────────────────────────────────────────────────
function buildLocalAudit(siteData: any) {
  const { site_name, ssl, tagline, permalink, posts_count = 0, pages_count = 0, plugins = [], theme, language, wp_version } = siteData;
  const checks: any[] = [];
  let score = 0;

  const add = (label: string, status: string, detail: string, pts: number) => {
    checks.push({ label, status, detail });
    if (status === "ok") score += pts;
  };

  add("HTTPS / SSL",              ssl ? "ok" : "fail",  ssl ? "Site usa HTTPS — bom para SEO e segurança ✓" : "Site não usa HTTPS — penalidade grave no Google. Instale SSL imediatamente.", 12);
  add("Meta Description (Tagline)", tagline ? "ok" : "warn", tagline || "Tagline vazia — configure em Configurações → Geral → Slogan", 8);
  add("Estrutura de URLs",        (permalink && permalink !== "/?p=%postname%") ? "ok" : "fail", (permalink && permalink !== "/?p=%postname%") ? `URLs amigáveis: ${permalink} ✓` : "URLs não amigáveis — mude para /%postname%/ em Configurações → Links Permanentes", 10);
  add("Volume de Conteúdo",       posts_count >= 10 ? "ok" : "warn", `${posts_count} posts publicados${posts_count < 10 ? " — publique pelo menos 10 para ganhar autoridade" : " ✓"}`, 8);
  add("Páginas Essenciais",       pages_count >= 3 ? "ok" : "warn",  `${pages_count} páginas${pages_count < 3 ? " — crie ao menos: Início, Sobre, Contato" : " ✓"}`, 6);
  const hasSeo = plugins.includes("wordpress-seo") || plugins.includes("seo-by-rank-math");
  add("Plugin SEO",               hasSeo ? "ok" : "fail",   hasSeo ? "Plugin SEO instalado ✓" : "Nenhum plugin SEO detectado — instale Yoast SEO ou Rank Math (gratuitos)", 15);
  const hasCache = plugins.some((p: string) => ["w3-total-cache","wp-super-cache","litespeed-cache","wp-rocket"].includes(p));
  add("Cache / Performance",      hasCache ? "ok" : "warn",  hasCache ? "Plugin de cache ativo ✓" : "Nenhum plugin de cache — instale LiteSpeed Cache ou W3 Total Cache", 8);
  add("WooCommerce Schema",       plugins.includes("woocommerce") ? "ok" : "info", plugins.includes("woocommerce") ? "WooCommerce ativo — schema de produto habilitado ✓" : "WooCommerce não instalado (necessário apenas para e-commerce)", 4);
  add("Tema Detectado",           "info", `${theme?.icon || "🌐"} ${theme?.label || "Personalizado"} — tipo: ${theme?.type || "custom"} | WP ${wp_version || "?"}`, 5);
  add("Idioma Configurado",       "ok",   `Idioma: ${language || "pt-BR"} ✓`, 5);
  add("Heading Structure",        posts_count > 0 ? "ok" : "warn",  posts_count > 0 ? "Conteúdo presente — verifique uso de H1/H2/H3 em cada post" : "Sem conteúdo — adicione posts com títulos H1/H2/H3 corretos", 5);
  add("Imagens Alt Text",         "warn", "Verifique se todas as imagens possuem texto alternativo (alt) preenchido", 0);
  add("Sitemap XML",              hasSeo ? "ok" : "warn", hasSeo ? "Sitemap gerado automaticamente pelo plugin SEO ✓" : "Sem sitemap — instale um plugin SEO para gerar sitemap XML automaticamente", 6);
  add("Robots.txt",               "info", `Verifique ${siteData.site_url || ""}/robots.txt — deve permitir Googlebot e bloquear /wp-admin`, 3);

  const pct = Math.min(100, Math.round((score / 95) * 100));
  const grade = pct >= 80 ? "A" : pct >= 60 ? "B" : pct >= 40 ? "C" : "D";
  const recs = checks.filter(c => c.status === "fail" || c.status === "warn").map(c => `${c.status === "fail" ? "🔴" : "🟡"} ${c.label}: ${c.detail}`);

  return {
    score: pct,
    grade,
    summary: `Site "${site_name || "analisado"}" obteve nota ${grade} (${pct}/100). ${checks.filter(c => c.status === "fail").length} problemas críticos e ${checks.filter(c => c.status === "warn").length} avisos encontrados.`,
    checks,
    recommendations: recs,
    quick_wins: recs.slice(0, 3),
    site_name: site_name || "",
    theme: theme || {},
    generated_at: new Date().toISOString(),
  };
}

// ── Default color palettes ─────────────────────────────────────────────────────
function getDefaultPalettes(style: string) {
  const palettes: Record<string, any[]> = {
    modern:   [
      { name: "Ocean Pro",    mood: "Confiante e tecnológico", primary: "#2563eb", secondary: "#1d4ed8", accent: "#06b6d4", text: "#1e293b", background: "#f8fafc" },
      { name: "Violet Tech",  mood: "Inovador e criativo",     primary: "#7c3aed", secondary: "#6d28d9", accent: "#a78bfa", text: "#1e1b4b", background: "#faf5ff" },
      { name: "Slate Edge",   mood: "Sóbrio e profissional",   primary: "#0f172a", secondary: "#334155", accent: "#38bdf8", text: "#0f172a", background: "#ffffff" },
    ],
    elegant:  [
      { name: "Gold Noir",    mood: "Luxo e sofisticação",     primary: "#92400e", secondary: "#78350f", accent: "#fbbf24", text: "#1c1917", background: "#fffbeb" },
      { name: "Rose Gold",    mood: "Elegância feminina",      primary: "#9f1239", secondary: "#881337", accent: "#fda4af", text: "#1c1917", background: "#fff1f2" },
      { name: "Navy Prestige",mood: "Autoridade clássica",     primary: "#1e3a5f", secondary: "#172a47", accent: "#c8a96e", text: "#0f172a", background: "#f0f9ff" },
    ],
    bold:     [
      { name: "Fire Brand",   mood: "Energia e ação",          primary: "#dc2626", secondary: "#b91c1c", accent: "#fb923c", text: "#1c1917", background: "#fff7ed" },
      { name: "Midnight Pop", mood: "Arrojado e moderno",      primary: "#000000", secondary: "#171717", accent: "#a3e635", text: "#000000", background: "#ffffff" },
      { name: "Deep Orange",  mood: "Vibrante e acessível",    primary: "#ea580c", secondary: "#c2410c", accent: "#fde68a", text: "#1c1917", background: "#fff7ed" },
    ],
    minimal:  [
      { name: "Pure White",   mood: "Limpo e minimalista",     primary: "#18181b", secondary: "#3f3f46", accent: "#a1a1aa", text: "#18181b", background: "#ffffff" },
      { name: "Stone Grey",   mood: "Neutro e elegante",       primary: "#44403c", secondary: "#292524", accent: "#78716c", text: "#1c1917", background: "#fafaf9" },
      { name: "Ink Blue",     mood: "Sofisticado e limpo",     primary: "#1e40af", secondary: "#1d4ed8", accent: "#dbeafe", text: "#1e3a8a", background: "#ffffff" },
    ],
    warm:     [
      { name: "Autumn Warm",  mood: "Acolhedor e familiar",    primary: "#b45309", secondary: "#92400e", accent: "#fcd34d", text: "#1c1917", background: "#fffbeb" },
      { name: "Terra Cotta",  mood: "Orgânico e humano",       primary: "#c2410c", secondary: "#9a3412", accent: "#fed7aa", text: "#1c1917", background: "#fff7ed" },
      { name: "Forest Green", mood: "Natural e sustentável",   primary: "#15803d", secondary: "#166534", accent: "#bbf7d0", text: "#14532d", background: "#f0fdf4" },
    ],
  };
  return palettes[style] || palettes.modern;
}

// ── Fallback SVG logo ─────────────────────────────────────────────────────────
function generateFallbackSvg(name: string, primary: string, textColor: string, style: string): string {
  const initials = name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  const radius = style === "bold" ? "4" : style === "elegant" ? "40" : "8";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 80">
  <rect x="4" y="4" width="72" height="72" rx="${radius}" fill="${primary}"/>
  <text x="40" y="52" font-family="system-ui,sans-serif" font-size="30" font-weight="800" text-anchor="middle" fill="${textColor}">${initials}</text>
  <text x="96" y="42" font-family="system-ui,sans-serif" font-size="24" font-weight="700" fill="${primary}">${name}</text>
  <text x="97" y="62" font-family="system-ui,sans-serif" font-size="11" fill="#94a3b8" letter-spacing="2">POWERED BY WPTECHSITES</text>
</svg>`;
}

// ── BrightData scraping ────────────────────────────────────────────────────────
async function scrapeBrightData(apiKey: string, category: string, city: string, limit: number, minRating: number): Promise<any[]> {
  try {
    // BrightData Google Maps dataset
    const DATASET_ID = "gd_l7q7dkf244hwjntr0"; // Google Maps Places
    const triggerRes = await fetch(`https://api.brightdata.com/datasets/v3/trigger?dataset_id=${DATASET_ID}&include_errors=true&limit=${limit}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify([{ keyword: `${category} em ${city}`, country_code: "BR", language: "pt" }]),
    });

    if (!triggerRes.ok) return [];
    const trigger = (await triggerRes.json()) as any;
    const snapshotId = trigger?.snapshot_id;
    if (!snapshotId) return [];

    // Poll for results (max 30s)
    for (let i = 0; i < 6; i++) {
      await new Promise(r => setTimeout(r, 5000));
      const snapRes = await fetch(`https://api.brightdata.com/datasets/v3/snapshot/${snapshotId}?format=json`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (!snapRes.ok) continue;
      const snap = (await snapRes.json()) as any;
      if (snap.status === "ready" && Array.isArray(snap.data)) {
        return snap.data
          .filter((p: any) => !minRating || (p.rating || 0) >= minRating)
          .slice(0, limit)
          .map(normalizePlace);
      }
    }
    return [];
  } catch {
    return [];
  }
}

// ── Directory job helpers ──────────────────────────────────────────────────────

function safeJsonParse(raw: any, fallback: any) {
  try { return JSON.parse(raw || "null") ?? fallback; } catch { return fallback; }
}

const BATCH_NEIGHBORHOODS: Record<string, string[]> = {
  curitiba:          ["Batel", "Centro", "Água Verde", "Bigorrilho", "Mercês", "Portão", "Bacacheri", "Cajuru", "São Francisco", "Champagnat", "Rebouças", "Cabral"],
  "são paulo":       ["Jardins", "Pinheiros", "Vila Madalena", "Moema", "Itaim Bibi", "Brooklin", "Centro", "Lapa", "Perdizes", "Santana", "Tatuapé", "Saúde"],
  "rio de janeiro":  ["Copacabana", "Ipanema", "Leblon", "Botafogo", "Centro", "Lapa", "Santa Teresa", "Barra da Tijuca", "Flamengo", "Tijuca", "Méier", "Madureira"],
  "nova york":       ["Manhattan", "Brooklyn", "Queens", "Bronx", "Harlem", "Midtown", "Downtown", "Williamsburg", "Astoria", "Flushing", "Staten Island"],
  "new york":        ["Manhattan", "Brooklyn", "Queens", "Bronx", "Harlem", "Midtown", "Downtown", "Williamsburg", "Astoria", "Flushing"],
  miami:             ["South Beach", "Brickell", "Wynwood", "Coral Gables", "Little Havana", "Design District", "Coconut Grove", "Downtown", "Hialeah"],
  "belo horizonte":  ["Savassi", "Lourdes", "Funcionários", "Centro", "Pampulha", "Buritis", "Belvedere", "Santa Efigênia", "Nova Suíça"],
  porto_alegre:      ["Moinhos de Vento", "Bela Vista", "Menino Deus", "Centro", "Petrópolis", "Boa Vista", "Jardim Botânico"],
};

const BATCH_SUB_NICHOS: Record<string, string[]> = {
  restaurantes:  ["restaurantes", "bares", "pizzarias", "hamburguerias", "churrascarias", "padarias", "cafeterias", "sushi"],
  "hotéis":      ["hotéis", "pousadas", "hostels", "apart-hotéis", "resorts", "suítes para casal"],
  saúde:         ["clínicas médicas", "dentistas", "farmácias", "academias de ginástica", "psicólogos", "fisioterapeutas", "nutricionistas"],
  serviços:      ["salões de beleza", "mecânicas automotivas", "escritórios de advocacia", "contabilidade", "imobiliárias", "pet shops"],
  turismo:       ["pontos turísticos", "museus", "parques e jardins", "tours guiados", "agências de viagem", "teatros e shows"],
  compras:       ["lojas de roupas", "shoppings", "supermercados", "farmácias", "eletrônicos", "livrarias"],
  educação:      ["escolas", "cursos e idiomas", "universidades", "centros de treinamento", "creches", "pré-escolas"],
  imóveis:       ["imobiliárias", "construtoras", "apartamentos à venda", "casas para alugar", "condomínios", "lançamentos"],
};

function generateBatchQueue(
  categories: string[],
  city: string,
  countPerCat: number,
  batchSize: number,
): { keyword: string; category: string; size: number; batch_index: number }[] {
  const cityLower     = city.toLowerCase().replace(/[^a-záàãâéêíóôõúç ]/gi, "");
  const neighborhoods = BATCH_NEIGHBORHOODS[cityLower] || [];
  const queue: { keyword: string; category: string; size: number; batch_index: number }[] = [];

  for (const category of categories) {
    const catLower     = category.toLowerCase();
    const subNichos    = BATCH_SUB_NICHOS[catLower] || [category];
    const batchCount   = Math.ceil(countPerCat / batchSize);

    for (let i = 0; i < batchCount; i++) {
      const remaining = Math.min(batchSize, countPerCat - i * batchSize);
      let keyword: string;
      if (i === 0) {
        keyword = `${category} em ${city}`;
      } else if (neighborhoods.length > 0 && i <= neighborhoods.length) {
        keyword = `${category} em ${neighborhoods[(i - 1) % neighborhoods.length]}, ${city}`;
      } else {
        keyword = `${subNichos[i % subNichos.length]} em ${city}`;
      }
      queue.push({ keyword, category, size: remaining, batch_index: i });
    }
  }
  return queue;
}

function extractNeighborhood(address: string, city: string): string {
  if (!address) return "";
  const parts = address.split(",").map(s => s.trim());
  const cityLower = city.toLowerCase();
  for (let i = parts.length - 1; i >= 1; i--) {
    const p = parts[i].toLowerCase();
    if (p.includes(cityLower) || /^\d{5}/.test(p) || /^[a-z]{2}$/i.test(p)) continue;
    if (!parts[i].match(/^\d+$/)) return parts[i].replace(/[-\/].+$/, "").trim();
  }
  return "";
}

function buildCsv(listings: any[]): string {
  const headers = [
    "nome", "categoria", "cidade", "bairro", "endereco_completo",
    "telefone", "website", "email_contato",
    "avaliacao", "total_avaliacoes", "score_marketing",
    "lat", "lng", "google_maps_url",
    "url_foto", "horario_funcionamento", "descricao",
    "place_id", "fonte", "data_scraping",
    "status_publicacao", "url_wordpress",
  ];
  const esc = (v: any) => `"${String(v ?? "").replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;
  const rows = listings.map((l: any) => {
    const rating = parseFloat(l.rating) || 0;
    const reviews = parseInt(l.review_count) || 0;
    const score   = rating > 0 ? (rating * Math.log10(reviews + 1)).toFixed(2) : "0.00";
    const nb      = extractNeighborhood(l.address || "", l.city || "");
    const mapsUrl = l.place_id ? `https://www.google.com/maps/place/?q=place_id:${l.place_id}` : "";
    return [
      l.name, l.category, l.city || "", nb, l.address,
      l.phone, l.website, l.email || "",
      l.rating || "", l.review_count || "", score,
      l.lat || "", l.lng || "", mapsUrl,
      l.photo_url || "", l.hours || "", l.description || "",
      l.place_id || "", l.source || "brightdata", l.scraped_at || "",
      l.wp_status || "pendente", l.wp_url || "",
    ].map(esc).join(",");
  });
  return [headers.join(","), ...rows].join("\n");
}

function normalizePlace(p: any) {
  return {
    name:         p.name || p.title || "Estabelecimento",
    address:      p.full_address || p.address || "",
    phone:        p.phone || p.phones?.[0] || "",
    website:      p.website || "",
    rating:       p.rating || null,
    review_count: p.reviews_count || p.review_count || 0,
    hours:        Array.isArray(p.working_hours) ? p.working_hours.join(", ") : (p.working_hours || ""),
    lat:          p.latitude  || p.lat || null,
    lng:          p.longitude || p.lng || null,
    place_id:     p.place_id  || p.cid || "",
    photo_url:    p.photo     || p.photos?.[0] || "",
    description:  p.description || p.about || "",
    category:     p.category || p.type || "",
    source:       "brightdata",
  };
}

// ── Demo listings via Gemini ───────────────────────────────────────────────────
async function generateDemoListings(category: string, city: string, limit: number): Promise<any[]> {
  const count = Math.min(limit, 12);

  // Curitiba-specific context for richer, more realistic data
  const cityContext = city.toLowerCase().includes("curitiba") || city.toLowerCase().includes("cwb")
    ? `Curitiba, PR. Use bairros reais: Batel, Água Verde, Centro, Bigorrilho, Mercês, Rebouças, Portão, Xaxim, Cajuru, Cabral, Bacacheri, São Francisco. Use DDI (41). Ruas reais: Rua XV de Novembro, Av. Batel, Rua Padre Anchieta, Av. Iguaçu, Rua Mateus Leme, Av. Marechal Floriano, Rua Comendador Araújo, Rua Emiliano Perneta.`
    : `${city}, Brasil`;

  const categoryContext = {
    restaurantes: "restaurantes, bares, padarias, cafeterias, churrascarias, sushi, pizza, hamburguerias",
    hotéis: "hotéis, pousadas, hostels, apart-hotéis",
    turismo: "pontos turísticos, museus, parques, atrações culturais",
    serviços: "salões de beleza, clínicas, academias, mecânicas, escritórios",
    compras: "lojas, shoppings, boutiques, mercados, farmácias",
  }[category.toLowerCase()] || category;

  const prompt = `Gere ${count} estabelecimentos de "${categoryContext}" em ${cityContext}

Retorne APENAS o JSON array abaixo, sem texto antes ou depois:
[
  {
    "name": "Nome real e criativo do estabelecimento",
    "address": "Rua/Av completa, número, Bairro, ${city}-PR",
    "phone": "(41) 9XXXX-XXXX ou (41) 3XXX-XXXX",
    "website": "https://www.nomeestabelecimento.com.br",
    "rating": 4.3,
    "review_count": 215,
    "hours": "Seg-Sex 11h-23h, Sáb-Dom 11h-00h",
    "description": "Descrição envolvente de 1-2 frases sobre o estabelecimento, especialidade e diferenciais",
    "category": "${category}",
    "source": "demo",
    "lat": -25.4284,
    "lng": -49.2733
  }
]

Regras:
- Nomes criativos e realistas (não genéricos)
- Endereços com bairros reais de ${city}
- Ratings entre 3.8 e 5.0, variados
- Descrições específicas e atraentes
- lat/lng aproximadas para ${city} (varie ±0.05)
- review_count entre 50 e 2000`;

  try {
    const raw = await callGeminiLong(prompt);
    const match = raw.match(/\[[\s\S]*\]/);
    const arr = match ? JSON.parse(match[0]) : [];
    return Array.isArray(arr) ? arr.slice(0, limit) : [];
  } catch {
    return [];
  }
}

function adjustColor(hex: string, amount: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, v));
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const toHex = (v: number) => clamp(v + amount).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export default router;
