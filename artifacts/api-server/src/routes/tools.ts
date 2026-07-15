import { Router } from "express";
import { db } from "@workspace/db";
import { toolsConfigTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { TOOLS, TOOL_CATEGORIES, getToolById } from "../lib/tools-data.js";

const router = Router();

router.get("/tools", async (req, res) => {
  try {
    const { category, search } = req.query as { category?: string; search?: string };
    const configs = await db.select().from(toolsConfigTable);
    const configMap = new Map(configs.map((c) => [c.id, c]));

    let tools = TOOLS.map((t) => ({
      id: t.id,
      label: t.label,
      category: t.category,
      description: t.description,
      tokenCost: t.tokenCost,
      isNew: t.isNew ?? null,
      isPro: t.isPro ?? null,
      usageCount: configMap.get(t.id)?.usageCount ?? 0,
      n8nWebhookUrl: configMap.get(t.id)?.n8nWebhookUrl ?? null,
    }));

    if (category) tools = tools.filter((t) => t.category === category);
    if (search) {
      const q = search.toLowerCase();
      tools = tools.filter((t) => t.label.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q));
    }

    res.json(tools);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to list tools" });
  }
});

router.get("/tools/categories", async (req, res) => {
  const counts = new Map<string, number>();
  for (const t of TOOLS) {
    counts.set(t.category, (counts.get(t.category) ?? 0) + 1);
  }
  res.json(TOOL_CATEGORIES.map((c) => ({ id: c.id, label: c.label, toolCount: counts.get(c.id) ?? 0 })));
});

router.get("/tools/:toolId", async (req, res) => {
  const { toolId } = req.params;
  const tool = getToolById(toolId);
  if (!tool) {
    res.status(404).json({ error: "Tool not found" });
    return;
  }
  const [config] = await db.select().from(toolsConfigTable).where(eq(toolsConfigTable.id, toolId)).limit(1);
  res.json({
    id: tool.id,
    label: tool.label,
    category: tool.category,
    description: tool.description,
    tokenCost: tool.tokenCost,
    isNew: tool.isNew ?? null,
    isPro: tool.isPro ?? null,
    usageCount: config?.usageCount ?? 0,
    n8nWebhookUrl: config?.n8nWebhookUrl ?? null,
  });
});

export default router;
