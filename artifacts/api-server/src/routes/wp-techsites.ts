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

// ── Ensure table exists (idempotent) ─────────────────────────────────────────
async function ensureWpSitesTable() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS wp_sites (
      id            SERIAL PRIMARY KEY,
      api_key       TEXT UNIQUE NOT NULL,
      site_url      TEXT NOT NULL,
      site_name     TEXT NOT NULL DEFAULT '',
      owner_email   TEXT NOT NULL,
      owner_name    TEXT NOT NULL DEFAULT '',
      credit_balance INTEGER NOT NULL DEFAULT 100,
      is_active     BOOLEAN NOT NULL DEFAULT true,
      plan          TEXT NOT NULL DEFAULT 'trial',
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_seen_at  TIMESTAMPTZ
    )
  `);
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

// Helper: call Gemini
async function callGemini(prompt: string): Promise<string> {
  const key = process.env["GEMINI"] || process.env["GOOGLE_API_KEY"];
  if (!key) throw new Error("GEMINI API key not configured");

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
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
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
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

function adjustColor(hex: string, amount: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, v));
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const toHex = (v: number) => clamp(v + amount).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export default router;
