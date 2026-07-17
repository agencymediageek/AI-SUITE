import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, generationsTable, toolsConfigTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";
import { getToolById } from "../lib/tools-data.js";

const router = Router();

const AI_MODELS = [
  { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", provider: "google", description: "Fast, capable multimodal model" },
  { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", provider: "google", description: "Advanced reasoning and analysis" },
  { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "openai", description: "Fast and cost-effective" },
  { id: "gpt-4o", name: "GPT-4o", provider: "openai", description: "Most capable OpenAI model" },
  { id: "claude-3-haiku", name: "Claude 3 Haiku", provider: "anthropic", description: "Fast and efficient" },
];

router.get("/ai/models", (_req, res) => {
  res.json(AI_MODELS);
});

router.post("/ai/generate", requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const { toolId, prompt, model: modelId, extraInputs } = req.body;

    if (!toolId || !prompt) {
      res.status(400).json({ error: "toolId and prompt are required" });
      return;
    }

    const tool = getToolById(toolId);
    if (!tool) {
      res.status(404).json({ error: "Tool not found" });
      return;
    }

    if (user.tokenBalance < tool.tokenCost) {
      res.status(402).json({ error: `Insufficient tokens. This tool costs ${tool.tokenCost} tokens.` });
      return;
    }

    // Check if tool has a configured N8N webhook — use it if available
    const [toolConfig] = await db.select().from(toolsConfigTable).where(eq(toolsConfigTable.id, toolId)).limit(1);
    let outputText = "";
    const usedModel = modelId || "gemini-2.0-flash";

    if (toolConfig?.n8nWebhookUrl) {
      // Forward to N8N webhook
      const webhookRes = await fetch(toolConfig.n8nWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolId, prompt, extraInputs, systemPrompt: tool.systemPrompt, userId: user.id }),
      });
      if (!webhookRes.ok) {
        res.status(502).json({ error: "N8N webhook error" });
        return;
      }
      const data = await webhookRes.json() as any;
      outputText = data.text || data.output || JSON.stringify(data);
    } else {
      // Direct Gemini call
      const apiKey = process.env["GEMINI_API_KEY"] || process.env["GOOGLE_API_KEY"] || process.env["GEMINI"];
      if (!apiKey) {
        res.status(500).json({ error: "AI API key not configured. Please set GEMINI_API_KEY in your environment." });
        return;
      }

      // Build extra context from inputs
      let fullPrompt = prompt;
      if (extraInputs && typeof extraInputs === "object") {
        const extras = Object.entries(extraInputs)
          .filter(([, v]) => v)
          .map(([k, v]) => `${k}: ${v}`)
          .join("\n");
        if (extras) fullPrompt = `${extras}\n\n${prompt}`;
      }

      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: tool.systemPrompt }] },
            contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
            generationConfig: { maxOutputTokens: 2048 },
          }),
        }
      );

      if (!geminiRes.ok) {
        const err = await geminiRes.text();
        req.log.error({ err }, "Gemini API error");
        res.status(502).json({ error: "AI generation failed. Please check your API key configuration." });
        return;
      }

      const data = await geminiRes.json() as any;
      outputText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    }

    // Deduct tokens
    await db.update(usersTable).set({ tokenBalance: sql`${usersTable.tokenBalance} - ${tool.tokenCost}` }).where(eq(usersTable.id, user.id));

    // Increment tool usage count
    await db.insert(toolsConfigTable).values({ id: toolId, usageCount: 1 }).onConflictDoUpdate({ target: toolsConfigTable.id, set: { usageCount: sql`${toolsConfigTable.usageCount} + 1` } });

    // Log generation
    await db.insert(generationsTable).values({
      userId: user.id,
      toolId,
      toolLabel: tool.label,
      prompt: prompt.slice(0, 500),
      output: outputText.slice(0, 5000),
      tokensUsed: tool.tokenCost,
      model: usedModel,
    });

    res.json({ text: outputText, tokensUsed: tool.tokenCost, model: usedModel });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "AI generation failed" });
  }
});

// Public chatbot endpoint (works with or without auth)
router.post("/ai/chat", async (req, res) => {
  try {
    const { message, history = [], lang = "en" } = req.body;

    if (!message || typeof message !== "string") {
      res.status(400).json({ error: "message is required" });
      return;
    }

    const apiKey = process.env["GEMINI_API_KEY"] || process.env["GOOGLE_API_KEY"] || process.env["GEMINI"];
    if (!apiKey) {
      res.status(500).json({ error: "AI API key not configured" });
      return;
    }

    const systemPrompt = lang === "pt"
      ? `Você é o assistente virtual da MediaGeek AI Suite, uma plataforma SaaS com mais de 100 ferramentas de IA para criadores de conteúdo, agências e profissionais de marketing digital. Seja prestativo, conciso e amigável. Responda sempre em português. Ajude os usuários a entender as ferramentas disponíveis, planos e como usar a plataforma. Se não souber algo específico, sugira que o usuário entre em contato pelo suporte.`
      : `You are the virtual assistant for MediaGeek AI Suite, a SaaS platform with 100+ AI tools for content creators, agencies and digital marketing professionals. Be helpful, concise and friendly. Always respond in English. Help users understand available tools, plans and how to use the platform. If you don't know something specific, suggest the user contact support.`;

    // Build conversation history for Gemini
    const contents = [];
    for (const msg of history.slice(-8)) {
      contents.push({ role: msg.role === "assistant" ? "model" : "user", parts: [{ text: msg.content }] });
    }
    contents.push({ role: "user", parts: [{ text: message }] });

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents,
          generationConfig: { maxOutputTokens: 512, temperature: 0.7 },
        }),
      }
    );

    if (!geminiRes.ok) {
      const err = await geminiRes.text();
      req.log.error({ err }, "Gemini chat error");
      res.status(502).json({ error: "AI chat failed" });
      return;
    }

    const data = await geminiRes.json() as any;
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || (lang === "pt" ? "Desculpe, não consegui processar sua mensagem." : "Sorry, I couldn't process your message.");

    res.json({ reply });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Chat failed" });
  }
});

router.get("/ai/usage", requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const generations = await db.select().from(generationsTable).where(eq(generationsTable.userId, user.id));
    const totalGenerations = generations.length;
    const tokensUsed = generations.reduce((sum, g) => sum + g.tokensUsed, 0);

    const toolCounts = new Map<string, { label: string; count: number }>();
    for (const g of generations) {
      const entry = toolCounts.get(g.toolId) ?? { label: g.toolLabel, count: 0 };
      entry.count++;
      toolCounts.set(g.toolId, entry);
    }

    const topTools = Array.from(toolCounts.entries())
      .map(([toolId, { label, count }]) => ({ toolId, label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    res.json({ totalGenerations, tokensUsed, tokenBalance: user.tokenBalance, topTools });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get usage" });
  }
});

export default router;
