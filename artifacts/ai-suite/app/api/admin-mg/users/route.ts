import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/pg";

export async function GET(req: NextRequest) {
  const session: any = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search") || "";
  const offset = (page - 1) * limit;

  try {
    let usersRes, countRes;

    if (search) {
      const like = `%${search}%`;
      [usersRes, countRes] = await Promise.all([
        query(
          `SELECT u.id, u.email, u.name, u.role, u.status, u.created_at,
                  COALESCE(ub.balance, 0) AS credits
           FROM users u
           LEFT JOIN user_balances ub ON ub.email = u.email
           WHERE u.email ILIKE $3 OR u.name ILIKE $3
           ORDER BY u.created_at DESC LIMIT $1 OFFSET $2`,
          [limit, offset, like]
        ),
        query(`SELECT COUNT(*) FROM users WHERE email ILIKE $1 OR name ILIKE $1`, [like]),
      ]);
    } else {
      [usersRes, countRes] = await Promise.all([
        query(
          `SELECT u.id, u.email, u.name, u.role, u.status, u.created_at,
                  COALESCE(ub.balance, 0) AS credits
           FROM users u
           LEFT JOIN user_balances ub ON ub.email = u.email
           ORDER BY u.created_at DESC LIMIT $1 OFFSET $2`,
          [limit, offset]
        ),
        query(`SELECT COUNT(*) FROM users`),
      ]);
    }

    return NextResponse.json({
      users: usersRes.rows,
      total: parseInt(countRes.rows[0].count),
      page,
      limit,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session: any = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { userId, action } = await req.json();
    let sql = "";

    if (action === "block") {
      sql = `UPDATE users SET status='disabled' WHERE id=$1`;
    } else if (action === "unblock") {
      sql = `UPDATE users SET status='active' WHERE id=$1`;
    } else if (action === "promote") {
      sql = `UPDATE users SET role='admin' WHERE id=$1`;
    } else if (action === "demote") {
      sql = `UPDATE users SET role='user' WHERE id=$1`;
    } else {
      return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
    }

    await query(sql, [userId]);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
