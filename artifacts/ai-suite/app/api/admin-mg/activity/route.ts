import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/pg";

export async function GET(req: NextRequest) {
  const session: any = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "25"), 50);

  try {
    const res = await query(`
      SELECT
        tl.id,
        tl.feature,
        tl.action,
        tl.amount,
        tl.model,
        tl.created_at,
        u.email,
        u.name
      FROM token_logs tl
      LEFT JOIN users u ON u.id = tl.user_id
      ORDER BY tl.created_at DESC
      LIMIT $1
    `, [limit]);

    return NextResponse.json({ activity: res.rows });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
