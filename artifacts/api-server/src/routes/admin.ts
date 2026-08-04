import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, generationsTable, meetingsTable, meetingSessionsTable, plansTable } from "@workspace/db";
import { eq, ilike, desc, sql, gte, and } from "drizzle-orm";
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

// ─── Metrics (SQL-aggregated, no full-table scans) ───────────────────────────
router.get("/admin/metrics", requireAdmin, async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const startOfToday = new Date(now); startOfToday.setHours(0, 0, 0, 0);

    const [
      [{ totalUsers }],
      [{ meetingsToday }],
      [{ activeSessions }],
      mrrRows,
      newUsersRaw,
      meetingsRaw,
      usersByPlanRaw,
      topUsersRaw,
    ] = await Promise.all([
      // Scalar counts — no full-table load
      db.select({ totalUsers: sql<number>`count(*)::int` }).from(usersTable),
      db.select({ meetingsToday: sql<number>`count(*)::int` }).from(meetingsTable).where(gte(meetingsTable.createdAt, startOfToday)),
      db.select({ activeSessions: sql<number>`count(*)::int` }).from(meetingSessionsTable).where(eq(meetingSessionsTable.status, 'active')),

      // MRR: SUM plan prices for users who have a non-null planId
      db.select({ mrr: sql<number>`COALESCE(SUM(p.price), 0)::numeric` })
        .from(usersTable)
        .innerJoin(plansTable, eq(usersTable.planId, plansTable.id)),

      // New users per day (last 30 days) — SQL GROUP BY date
      db.select({
        date: sql<string>`DATE(${usersTable.createdAt})::text`,
        count: sql<number>`count(*)::int`,
      }).from(usersTable).where(gte(usersTable.createdAt, thirtyDaysAgo))
        .groupBy(sql`DATE(${usersTable.createdAt})`),

      // Meetings per day (last 30 days) — SQL GROUP BY date
      db.select({
        date: sql<string>`DATE(${meetingsTable.createdAt})::text`,
        count: sql<number>`count(*)::int`,
      }).from(meetingsTable).where(gte(meetingsTable.createdAt, thirtyDaysAgo))
        .groupBy(sql`DATE(${meetingsTable.createdAt})`),

      // Users by plan — SQL GROUP BY
      db.select({
        planName: sql<string>`COALESCE(${usersTable.planName}, 'Free')`,
        count: sql<number>`count(*)::int`,
      }).from(usersTable).groupBy(sql`COALESCE(${usersTable.planName}, 'Free')`),

      // Top 10 users by meeting count — SQL aggregation
      db.select({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        planName: usersTable.planName,
        meetingCount: sql<number>`count(${meetingsTable.id})::int`,
      }).from(usersTable)
        .leftJoin(meetingsTable, eq(meetingsTable.userId, usersTable.id))
        .groupBy(usersTable.id, usersTable.name, usersTable.email, usersTable.planName)
        .orderBy(desc(sql`count(${meetingsTable.id})`))
        .limit(10),
    ]);

    const estimatedMRR = Number(mrrRows[0]?.mrr ?? 0);

    // Fill zero-count days for the 30-day ranges
    const usersByDayMap = new Map(newUsersRaw.map(r => [r.date, r.count]));
    const meetingsByDayMap = new Map(meetingsRaw.map(r => [r.date, r.count]));
    const dayRange = generateDayRange(thirtyDaysAgo, now);
    const newUsersPerDay = dayRange.map(date => ({ date, count: usersByDayMap.get(date) ?? 0 }));
    const meetingsPerDay = dayRange.map(date => ({ date, count: meetingsByDayMap.get(date) ?? 0 }));

    res.json({
      totalUsers,
      meetingsToday,
      estimatedMRR,
      activeSessions,
      usersByPlan: usersByPlanRaw,
      meetingsPerDay,
      newUsersPerDay,
      topUsers: topUsersRaw,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get metrics" });
  }
});

router.get("/admin/metrics/realtime", requireAdmin, async (req, res) => {
  try {
    const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
    const [[{ activeSessions }], [{ meetingsToday }]] = await Promise.all([
      db.select({ activeSessions: sql<number>`count(*)::int` })
        .from(meetingSessionsTable).where(eq(meetingSessionsTable.status, 'active')),
      db.select({ meetingsToday: sql<number>`count(*)::int` })
        .from(meetingsTable).where(gte(meetingsTable.createdAt, startOfToday)),
    ]);
    res.json({ activeSessions, meetingsToday });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get realtime metrics" });
  }
});

router.get("/admin/stats", requireAdmin, async (req, res) => {
  try {
    const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
    const [[{ totalUsers }], [{ totalGenerations, totalTokensUsed, activeToday }], usersByPlanRaw] = await Promise.all([
      db.select({ totalUsers: sql<number>`count(*)::int` }).from(usersTable),
      db.select({
        totalGenerations: sql<number>`count(*)::int`,
        totalTokensUsed: sql<number>`COALESCE(SUM(${generationsTable.tokensUsed}), 0)::int`,
        activeToday: sql<number>`count(*) FILTER (WHERE ${generationsTable.createdAt} >= ${startOfToday})::int`,
      }).from(generationsTable),
      db.select({
        planName: sql<string>`COALESCE(${usersTable.planName}, 'Free')`,
        count: sql<number>`count(*)::int`,
      }).from(usersTable).groupBy(sql`COALESCE(${usersTable.planName}, 'Free')`),
    ]);

    res.json({
      totalUsers,
      totalGenerations,
      totalTokensUsed,
      activeToday,
      revenueTotal: 0,
      usersByPlan: usersByPlanRaw,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get admin stats" });
  }
});

// ─── Metrics CSV export ───────────────────────────────────────────────────────
router.get("/admin/metrics/export.csv", requireAdmin, async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const startOfToday = new Date(now); startOfToday.setHours(0, 0, 0, 0);

    const [[{ totalUsers }], [{ meetingsToday }], [{ activeSessions }], meetingsRaw, newUsersRaw] = await Promise.all([
      db.select({ totalUsers: sql<number>`count(*)::int` }).from(usersTable),
      db.select({ meetingsToday: sql<number>`count(*)::int` }).from(meetingsTable).where(gte(meetingsTable.createdAt, startOfToday)),
      db.select({ activeSessions: sql<number>`count(*)::int` }).from(meetingSessionsTable).where(eq(meetingSessionsTable.status, 'active')),
      db.select({
        date: sql<string>`DATE(${meetingsTable.createdAt})::text`,
        meetings: sql<number>`count(*)::int`,
      }).from(meetingsTable).where(gte(meetingsTable.createdAt, thirtyDaysAgo))
        .groupBy(sql`DATE(${meetingsTable.createdAt})`).orderBy(sql`DATE(${meetingsTable.createdAt})`),
      db.select({
        date: sql<string>`DATE(${usersTable.createdAt})::text`,
        newUsers: sql<number>`count(*)::int`,
      }).from(usersTable).where(gte(usersTable.createdAt, thirtyDaysAgo))
        .groupBy(sql`DATE(${usersTable.createdAt})`).orderBy(sql`DATE(${usersTable.createdAt})`),
    ]);

    const meetingMap = new Map(meetingsRaw.map(r => [r.date, r.meetings]));
    const userMap = new Map(newUsersRaw.map(r => [r.date, r.newUsers]));
    const days = generateDayRange(thirtyDaysAgo, now);

    const csvLines = [
      `# APEX Platform KPI Report — ${now.toISOString().slice(0, 10)}`,
      `# Total Users,${totalUsers}`,
      `# Meetings Today,${meetingsToday}`,
      `# Active Sessions,${activeSessions}`,
      ``,
      `Date,Meetings,New Users`,
      ...days.map(d => `${d},${meetingMap.get(d) ?? 0},${userMap.get(d) ?? 0}`),
    ];

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="apex-metrics-${now.toISOString().slice(0, 10)}.csv"`);
    res.send(csvLines.join('\n'));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to export metrics" });
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
