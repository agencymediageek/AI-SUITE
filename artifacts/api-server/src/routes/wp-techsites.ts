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
import { wpSitesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";

const router = Router();

// ── Ensure table exists + migrate new columns (idempotent) ───────────────────
async function ensureWpSitesTable() {
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
  // Try Gemini first
  const geminiKey = process.env["GEMINI"] || process.env["GOOGLE_API_KEY"];
  if (geminiKey) {
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

// ── POST /api/wp/register ─────────────────────────────────────────────────────
// Creates a new WP TechSites account and returns an API key.
router.post("/wp/register", async (req, res) => {
  try {
    const { email, name, siteUrl, siteName } = req.body;
    if (!email || !siteUrl) {
      res.status(400).json({ error: "email e siteUrl são obrigatórios" });
      return;
    }

    // Check if site already registered
    const [existing] = await db
      .select()
      .from(wpSitesTable)
      .where(eq(wpSitesTable.ownerEmail, email))
      .limit(1);

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
    const [site] = await db
      .insert(wpSitesTable)
      .values({
        apiKey,
        siteUrl: siteUrl.trim(),
        siteName: siteName?.trim() || new URL(siteUrl).hostname,
        ownerEmail: email.trim().toLowerCase(),
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

    const prompt = `Você é um especialista em marketing de conteúdo digital.
Crie conteúdo para ${type === "post" ? "um artigo de blog" : "uma página"} sobre: "${topic}"
Tom: ${tone}. ${langInstruction}
Site: ${site.siteName || site.siteUrl}

Retorne JSON com este formato exato (nada antes ou depois):
{
  "title": "Título atrativo para SEO",
  "metaDescription": "Meta description de até 155 caracteres",
  "content": "Conteúdo em HTML com h2, p, ul — completo e profissional",
  "excerpt": "Resumo de 1 parágrafo"
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
// Alias used by plugin v2.0.0 frontend chatbot widget (messages[] array style)
router.post("/wp/chatbot", requireSiteKey, async (req, res) => {
  try {
    const site = (req as any).wpSite;
    const { messages = [], siteUrl, prompt: customPrompt } = req.body;
    if (!messages.length) { res.status(400).json({ error: "messages required" }); return; }
    if (site.creditBalance <= 0) {
      res.json({ reply: "Seu saldo de créditos acabou. Acesse wp.techsites.ai para recarregar." });
      return;
    }

    const history = messages
      .slice(-8)
      .map((m: any) => `${m.role === "user" ? "Visitante" : "Assistente"}: ${m.content}`)
      .join("\n");

    const systemPrompt = customPrompt ||
      `Você é o assistente IA do site "${site.siteName || siteUrl}". Responda de forma útil e amigável em português.`;

    const reply = await callGemini(`${systemPrompt}\n\nHistórico:\n${history}\n\nResposta:`);

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

    const siteData = req.body;
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

    const raw = await callGeminiLong(prompt);
    let audit: any;
    try {
      const match = raw.match(/\{[\s\S]*\}/);
      audit = match ? JSON.parse(match[0]) : null;
    } catch {
      audit = null;
    }

    if (!audit) {
      // Structured fallback
      audit = buildLocalAudit(siteData);
    }

    await db.update(wpSitesTable).set({ creditBalance: site.creditBalance - 10 }).where(eq(wpSitesTable.id, site.id));
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
    let wpErrors: string[] = [];
    if (save_to === "wp" && site.wpRestUrl && site.wpUser && site.wpAppPassword) {
      for (const listing of listings) {
        try {
          // Try our custom endpoint first (handles job_listing CPT + meta)
          await wpCall(site, "/wp-techsites/v1/listings", "POST", {
            title:       listing.name,
            content:     listing.description ? `<p>${listing.description}</p>` : "",
            address:     listing.address,
            phone:       listing.phone,
            website:     listing.website,
            rating:      listing.rating,
            review_count:listing.review_count,
            hours:       listing.hours,
            lat:         listing.lat,
            lng:         listing.lng,
            category:    listing.category,
            source:      listing.source || "import",
          });
          wpImported++;
        } catch (e: any) {
          // Fallback: create as regular post
          try {
            await wpCall(site, "/wp/v2/posts", "POST", {
              title:   listing.name,
              status:  "draft",
              content: `<p>${listing.description || ""}</p><p>📍 ${listing.address || ""}</p><p>📞 ${listing.phone || ""}</p>`,
            });
            wpImported++;
          } catch (e2: any) {
            wpErrors.push(listing.name + ": " + e2.message);
          }
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
        wp_imported:  wpImported,
        wp_errors:    wpErrors.length ? wpErrors.slice(0, 3) : undefined,
        wp_connected: !!(site.wpRestUrl && site.wpUser),
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

    const prompt = `Você é um assistente que controla um site WordPress via comandos em linguagem natural.
Site: "${site.siteName}" (${context || site.siteUrl})

Comando do usuário: "${command}"

Interprete o comando e retorne JSON com as ações a executar. Formato EXATO (nada antes ou depois):
{
  "message": "Mensagem amigável confirmando o que foi feito",
  "actions": [
    {
      "type": "<update_post_title|update_post_content|update_option|update_tagline|create_post>",
      "post_id": <number ou null>,
      "option": "<nome da opção wp se type=update_option>",
      "value": "<novo valor>"
    }
  ]
}

Tipos de ação disponíveis:
- update_tagline: muda a tagline/slogan do site (valor = nova tagline)
- update_option: muda uma opção do WordPress (option = nome da opção, value = novo valor)
- create_post: cria um novo post (value = título, e inclua um campo "content" com o conteúdo)
- update_post_title: muda o título de um post específico
- update_post_content: muda o conteúdo de um post específico

Exemplos:
- "muda a tagline para X" → [{"type":"update_tagline","value":"X"}]
- "cria um post sobre Y" → [{"type":"create_post","value":"Título sobre Y","content":"Conteúdo..."}]
- "ativa o blog" → [{"type":"update_option","option":"show_on_front","value":"posts"}]

Se o comando não for executável, retorne actions=[] e explique no message.`;

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
          } else if (action.type === "update_option" && action.option) {
            await wpCall(site, "/wp/v2/settings", "POST", { [action.option]: action.value });
            wpResults.push({ action: action.type, success: true });
          } else if (action.type === "create_post") {
            const post = await wpCall(site, "/wp/v2/posts", "POST", {
              title:   action.value,
              content: action.content || "",
              status:  "draft",
            });
            wpResults.push({ action: action.type, success: true, post_id: post.id });
          } else if (action.type === "update_site_title") {
            await wpCall(site, "/wp/v2/settings", "POST", { title: action.value });
            wpResults.push({ action: action.type, success: true });
          }
        } catch (e: any) {
          wpResults.push({ action: action.type, success: false, error: e.message });
        }
      }
      if (wpResults.length) {
        const done = wpResults.filter(r => r.success).length;
        result.message = `${result.message || ""} — ${done}/${wpResults.length} ação(ões) aplicada(s) no WordPress.`.trim();
      }
    }

    res.json({ ...result, wpResults, creditsUsed: 3 });
  } catch (err: any) {
    req.log?.error(err, "wp/chat-editor error");
    res.status(500).json({ error: "Erro ao processar comando" });
  }
});

// ── GET /api/wp/tools ─────────────────────────────────────────────────────────
router.get("/wp/tools", requireSiteKey, async (req, res) => {
  const site = (req as any).wpSite;
  res.json({ tools: getAvailableTools(site.plan), credits: site.creditBalance });
});

// ── GET /api/wp/dashboard ─────────────────────────────────────────────────────
// Dashboard data for the wp.techsites.ai customer panel.
router.get("/wp/dashboard", requireSiteKey, async (req, res) => {
  const site = (req as any).wpSite;
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
    },
    tools: getAvailableTools(site.plan),
    usageTip: "Cada ação consome créditos. Recarregue a qualquer momento.",
  });
});

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

// ── Extended AI call (more tokens for audit/scraping) ────────────────────────
async function callGeminiLong(prompt: string): Promise<string> {
  // Try Gemini with higher token limit
  const geminiKey = process.env["GEMINI"] || process.env["GOOGLE_API_KEY"];
  if (geminiKey) {
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
  const prompt = `Gere ${count} estabelecimentos fictícios mas realistas de "${category}" em "${city}", Brasil.
Retorne JSON array EXATO (nada antes ou depois):
[
  {
    "name": "Nome do estabelecimento",
    "address": "Endereço completo realista em ${city}",
    "phone": "(XX) XXXX-XXXX",
    "website": "https://www.exemplo.com.br",
    "rating": 4.2,
    "review_count": 127,
    "hours": "Seg-Sex 8h-18h, Sáb 8h-13h",
    "description": "Breve descrição do estabelecimento",
    "category": "${category}",
    "source": "demo"
  }
]
Use nomes, endereços e telefones realistas para ${city}. Varie os ratings entre 3.5 e 5.0.`;

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
