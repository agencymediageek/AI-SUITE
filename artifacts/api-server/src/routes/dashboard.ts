import { Router } from "express";
import { db } from "@workspace/db";
import { generationsTable, toolsConfigTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";
import { TOOLS } from "../lib/tools-data.js";

const router = Router();

router.get("/dashboard/stats", requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const generations = await db.select().from(generationsTable).where(eq(generationsTable.userId, user.id));
    const tokensUsed = generations.reduce((s, g) => s + g.tokensUsed, 0);

    // Group by day (last 7 days)
    const now = Date.now();
    const generationsByDay = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now - (6 - i) * 86400000);
      const dateStr = d.toISOString().slice(0, 10);
      const count = generations.filter((g) => g.createdAt.toISOString().slice(0, 10) === dateStr).length;
      return { date: dateStr, count };
    });

    res.json({
      tokenBalance: user.tokenBalance,
      tokensUsed,
      totalGenerations: generations.length,
      planName: user.planName || "Free",
      favoriteCount: 0,
      generationsByDay,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get dashboard stats" });
  }
});

router.get("/dashboard/recent", requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const records = await db.select().from(generationsTable).where(eq(generationsTable.userId, user.id)).orderBy(desc(generationsTable.createdAt)).limit(10);
    res.json(records.map((r) => ({ id: r.id, toolId: r.toolId, toolLabel: r.toolLabel, prompt: r.prompt, output: r.output, tokensUsed: r.tokensUsed, model: r.model, createdAt: r.createdAt.toISOString() })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get recent generations" });
  }
});

router.get("/dashboard/trending-tools", async (_req, res) => {
  try {
    const configs = await db.select().from(toolsConfigTable).orderBy(desc(toolsConfigTable.usageCount)).limit(8);
    const toolIds = configs.map((c) => c.id);
    const tools = TOOLS.filter((t) => toolIds.includes(t.id)).map((t) => {
      const config = configs.find((c) => c.id === t.id);
      return { id: t.id, label: t.label, category: t.category, description: t.description, tokenCost: t.tokenCost, isNew: t.isNew ?? null, isPro: t.isPro ?? null, usageCount: config?.usageCount ?? 0, n8nWebhookUrl: config?.n8nWebhookUrl ?? null };
    });

    // If no usage data yet, return top tools from TOOLS list
    if (tools.length < 4) {
      const topDefaults = TOOLS.slice(0, 8).map((t) => ({ id: t.id, label: t.label, category: t.category, description: t.description, tokenCost: t.tokenCost, isNew: t.isNew ?? null, isPro: t.isPro ?? null, usageCount: 0, n8nWebhookUrl: null }));
      res.json(topDefaults);
      return;
    }

    res.json(tools);
  } catch (err) {
    res.status(500).json({ error: "Failed to get trending tools" });
  }
});

export default router;
