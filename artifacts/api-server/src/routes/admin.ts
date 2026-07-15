import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, generationsTable } from "@workspace/db";
import { eq, ilike, desc, sql } from "drizzle-orm";
import { requireAdmin } from "../lib/auth.js";

const router = Router();

router.get("/admin/stats", requireAdmin, async (req, res) => {
  try {
    const users = await db.select().from(usersTable);
    const generations = await db.select().from(generationsTable);
    const today = new Date().toISOString().slice(0, 10);
    const activeToday = generations.filter((g) => g.createdAt.toISOString().slice(0, 10) === today).length;
    const totalTokensUsed = generations.reduce((s, g) => s + g.tokensUsed, 0);

    const planCounts = new Map<string, number>();
    for (const u of users) {
      const plan = u.planName || "Free";
      planCounts.set(plan, (planCounts.get(plan) ?? 0) + 1);
    }

    res.json({
      totalUsers: users.length,
      totalGenerations: generations.length,
      totalTokensUsed,
      activeToday,
      revenueTotal: 0, // Would come from WooCommerce
      usersByPlan: Array.from(planCounts.entries()).map(([planName, count]) => ({ planName, count })),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get admin stats" });
  }
});

router.get("/admin/users", requireAdmin, async (req, res) => {
  try {
    const limit = Math.min(Number(req.query["limit"]) || 50, 200);
    const offset = Number(req.query["offset"]) || 0;
    const search = req.query["search"] as string | undefined;

    let query = db.select().from(usersTable);
    if (search) {
      query = query.where(ilike(usersTable.email, `%${search}%`)) as any;
    }
    const users = await (query as any).orderBy(desc(usersTable.createdAt)).limit(limit).offset(offset);
    res.json(users.map((u: any) => ({ id: u.id, email: u.email, name: u.name, role: u.role, tokenBalance: u.tokenBalance, planId: u.planId, planName: u.planName, createdAt: u.createdAt.toISOString() })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to list users" });
  }
});

router.patch("/admin/users/:userId", requireAdmin, async (req, res) => {
  try {
    const userId = Number(req.params["userId"]);
    const { tokenBalance, planId, role, isActive } = req.body;
    const updates: Record<string, any> = {};
    if (tokenBalance !== undefined) updates.tokenBalance = tokenBalance;
    if (planId !== undefined) updates.planId = planId;
    if (role !== undefined) updates.role = role;
    if (isActive !== undefined) updates.isActive = isActive;
    const [updated] = await db.update(usersTable).set(updates).where(eq(usersTable.id, userId)).returning();
    res.json({ id: updated.id, email: updated.email, name: updated.name, role: updated.role, tokenBalance: updated.tokenBalance, planId: updated.planId, planName: updated.planName, createdAt: updated.createdAt.toISOString() });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update user" });
  }
});

router.delete("/admin/users/:userId", requireAdmin, async (req, res) => {
  try {
    const userId = Number(req.params["userId"]);
    await db.delete(usersTable).where(eq(usersTable.id, userId));
    res.json({ success: true, message: "User deleted" });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

export default router;
