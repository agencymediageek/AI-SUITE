import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, generationsTable, favoritesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";
import { TOOLS, getToolById } from "../lib/tools-data.js";

const router = Router();

router.get("/user/profile", requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const generations = await db.select().from(generationsTable).where(eq(generationsTable.userId, user.id));
    const favorites = await db.select().from(favoritesTable).where(eq(favoritesTable.userId, user.id));
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tokenBalance: user.tokenBalance,
      planId: user.planId,
      planName: user.planName,
      createdAt: user.createdAt.toISOString(),
      totalGenerations: generations.length,
      favoriteToolIds: favorites.map((f) => f.toolId),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get profile" });
  }
});

router.patch("/user/profile", requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const { name, email } = req.body;
    const updates: Partial<{ name: string; email: string }> = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    const [updated] = await db.update(usersTable).set(updates).where(eq(usersTable.id, user.id)).returning();
    res.json({ id: updated.id, email: updated.email, name: updated.name, role: updated.role, tokenBalance: updated.tokenBalance, planId: updated.planId, planName: updated.planName, createdAt: updated.createdAt.toISOString(), totalGenerations: 0, favoriteToolIds: [] });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

router.get("/user/history", requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const limit = Math.min(Number(req.query["limit"]) || 20, 100);
    const offset = Number(req.query["offset"]) || 0;
    const records = await db.select().from(generationsTable).where(eq(generationsTable.userId, user.id)).orderBy(desc(generationsTable.createdAt)).limit(limit).offset(offset);
    res.json(records.map((r) => ({ id: r.id, toolId: r.toolId, toolLabel: r.toolLabel, prompt: r.prompt, output: r.output, tokensUsed: r.tokensUsed, model: r.model, createdAt: r.createdAt.toISOString() })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get history" });
  }
});

router.get("/user/favorites", requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const favorites = await db.select().from(favoritesTable).where(eq(favoritesTable.userId, user.id));
    const toolIds = favorites.map((f) => f.toolId);
    const tools = TOOLS.filter((t) => toolIds.includes(t.id)).map((t) => ({ id: t.id, label: t.label, category: t.category, description: t.description, tokenCost: t.tokenCost, isNew: t.isNew ?? null, isPro: t.isPro ?? null, usageCount: null, n8nWebhookUrl: null }));
    res.json(tools);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get favorites" });
  }
});

router.post("/user/favorites/:toolId", requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const { toolId } = req.params;
    if (!getToolById(toolId)) {
      res.status(404).json({ error: "Tool not found" });
      return;
    }
    await db.insert(favoritesTable).values({ userId: user.id, toolId }).onConflictDoNothing();
    res.json({ success: true, message: "Added to favorites" });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to add favorite" });
  }
});

router.delete("/user/favorites/:toolId", requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const { toolId } = req.params;
    await db.delete(favoritesTable).where(eq(favoritesTable.userId, user.id));
    res.json({ success: true, message: "Removed from favorites" });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to remove favorite" });
  }
});

export default router;
