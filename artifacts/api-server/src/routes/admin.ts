import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, generationsTable, meetingsTable, meetingSessionsTable, plansTable } from "@workspace/db";
import { eq, ilike, desc, sql } from "drizzle-orm";
import { requireAdmin } from "../lib/auth.js";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function generateDayRange(start: Date, end: Date): string[] {
  const days: string[] = [];
  const current = new Date(start);
  current.setHours(0, 0, 0, 0);
  const endDate = new Date(end);
  endDate.setHours(23, 59, 59, 999);
  while (current <= endDate) {
    days.push(current.toISOString().slice(0, 10));
    current.setDate(current.getDate() + 1);
  }
  return days;
}

const router = Router();

// ─── Metrics ─────────────────────────────────────────────────────────────────
router.get("/admin/metrics", requireAdmin, async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const todayStr = now.toISOString().slice(0, 10);

    const [users, meetings, sessions, plans] = await Promise.all([
      db.select().from(usersTable),
      db.select().from(meetingsTable),
      db.select().from(meetingSessionsTable),
      db.select().from(plansTable),
    ]);

    // KPI counts
    const totalUsers = users.length;
    const meetingsToday = meetings.filter(m => m.createdAt.toISOString().slice(0, 10) === todayStr).length;
    const activeSessions = sessions.filter(s => s.status === 'active').length;

    // Estimated MRR: sum plan prices for users who have an active plan
    const planPriceMap = new Map<string, number>(plans.map(p => [p.id, p.price]));
    const estimatedMRR = users.reduce((sum, u) => {
      if (u.planId) return sum + (planPriceMap.get(u.planId) ?? 0);
      return sum;
    }, 0);

    // New users per day (last 30 days) — fill zeros for missing days
    const usersByDay = new Map<string, number>();
    for (const u of users) {
      if (u.createdAt >= thirtyDaysAgo) {
        const day = u.createdAt.toISOString().slice(0, 10);
        usersByDay.set(day, (usersByDay.get(day) ?? 0) + 1);
      }
    }
    const newUsersPerDay = generateDayRange(thirtyDaysAgo, now).map(date => ({
      date,
      count: usersByDay.get(date) ?? 0,
    }));

    // Meetings per day (last 30 days)
    const meetingsByDay = new Map<string, number>();
    for (const m of meetings) {
      if (m.createdAt >= thirtyDaysAgo) {
        const day = m.createdAt.toISOString().slice(0, 10);
        meetingsByDay.set(day, (meetingsByDay.get(day) ?? 0) + 1);
      }
    }
    const meetingsPerDay = generateDayRange(thirtyDaysAgo, now).map(date => ({
      date,
      count: meetingsByDay.get(date) ?? 0,
    }));

    // Users by plan (pie chart)
    const planCounts = new Map<string, number>();
    for (const u of users) {
      const plan = u.planName ?? 'Free';
      planCounts.set(plan, (planCounts.get(plan) ?? 0) + 1);
    }
    const usersByPlan = Array.from(planCounts.entries()).map(([planName, count]) => ({ planName, count }));

    // Top 10 most active users by meeting count
    const meetingCountByUser = new Map<number, number>();
    for (const m of meetings) {
      meetingCountByUser.set(m.userId, (meetingCountByUser.get(m.userId) ?? 0) + 1);
    }
    const topUsers = users
      .map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        planName: u.planName ?? null,
        meetingCount: meetingCountByUser.get(u.id) ?? 0,
      }))
      .sort((a, b) => b.meetingCount - a.meetingCount)
      .slice(0, 10);

    res.json({ totalUsers, meetingsToday, estimatedMRR, activeSessions, usersByPlan, meetingsPerDay, newUsersPerDay, topUsers });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get metrics" });
  }
});

router.get("/admin/metrics/realtime", requireAdmin, async (req, res) => {
  try {
    const todayStr = new Date().toISOString().slice(0, 10);
    const [sessions, meetings] = await Promise.all([
      db.select({ status: meetingSessionsTable.status }).from(meetingSessionsTable),
      db.select({ createdAt: meetingsTable.createdAt }).from(meetingsTable),
    ]);
    res.json({
      activeSessions: sessions.filter(s => s.status === 'active').length,
      meetingsToday: meetings.filter(m => m.createdAt.toISOString().slice(0, 10) === todayStr).length,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get realtime metrics" });
  }
});

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
