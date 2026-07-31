import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/pg";

export async function GET(_req: NextRequest) {
  const session: any = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [usersRes, activeRes, generationsRes, revenueRes, topToolsRes] = await Promise.all([
      query("SELECT COUNT(*) AS total FROM users"),
      query(`
        SELECT COUNT(DISTINCT user_id) AS active FROM token_logs
        WHERE created_at > NOW() - INTERVAL '7 days'
      `),
      query(
        "SELECT COUNT(*) AS total, COALESCE(SUM(ABS(amount)),0) AS tokens FROM token_logs WHERE amount < 0"
      ),
      // Stripe uses 'succeeded', MercadoPago uses 'active' or 'approved'
      query(
        `SELECT COALESCE(SUM(amount),0) AS total FROM payments
         WHERE status IN ('succeeded','completed','active','approved','paid')`
      ),
      query(`
        SELECT feature AS tool, COUNT(*) AS count
        FROM token_logs WHERE feature IS NOT NULL
        GROUP BY feature ORDER BY count DESC LIMIT 8
      `),
    ]);

    const dailyRes = await query(`
      SELECT DATE(created_at) AS day, COUNT(*) AS count
      FROM token_logs
      WHERE created_at > NOW() - INTERVAL '30 days' AND amount < 0
      GROUP BY day ORDER BY day ASC
    `);

    const recentRes = await query(`
      SELECT id, email, name, role, status, created_at
      FROM users ORDER BY created_at DESC LIMIT 5
    `);

    return NextResponse.json({
      totalUsers: parseInt(usersRes.rows[0]?.total || "0"),
      activeUsers7d: parseInt(activeRes.rows[0]?.active || "0"),
      totalGenerations: parseInt(generationsRes.rows[0]?.total || "0"),
      totalTokensUsed: parseInt(generationsRes.rows[0]?.tokens || "0"),
      // payments.amount is stored in cents/smallest unit; divide by 100 for display
      revenue: parseFloat(revenueRes.rows[0]?.total || "0") / 100,
      topTools: topToolsRes.rows,
      dailyGenerations: dailyRes.rows,
      recentUsers: recentRes.rows,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
