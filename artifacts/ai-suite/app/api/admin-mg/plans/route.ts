import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/pg";
import { randomUUID } from "crypto";

export async function GET(_req: NextRequest) {
  const session: any = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const res = await query("SELECT * FROM pricing_plans ORDER BY price ASC");
    return NextResponse.json({ plans: res.rows });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session: any = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      name, price, tokens = 1000,
      interval = "monthly",
      features = [], ai_tools = [],
      is_active = true, description = "",
      popular = false, cta = "Assinar"
    } = body;

    if (!name || price === undefined) {
      return NextResponse.json({ error: "Nome e preço são obrigatórios" }, { status: 400 });
    }

    const id = randomUUID();

    const res = await query(
      `INSERT INTO pricing_plans (id, name, price, tokens, interval, features, ai_tools, is_active, description, popular, cta)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [id, name, Math.round(Number(price)), tokens, interval, features, ai_tools, is_active, description, popular, cta]
    );
    return NextResponse.json({ plan: res.rows[0] });
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
    const body = await req.json();
    const { id, ...fields } = body;
    if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });

    // Only allow known columns
    const allowed = ["name","price","tokens","interval","features","ai_tools","is_active","description","popular","cta"];
    const safe = Object.fromEntries(Object.entries(fields).filter(([k]) => allowed.includes(k)));

    if (Object.keys(safe).length === 0) {
      return NextResponse.json({ error: "Nenhum campo válido para atualizar" }, { status: 400 });
    }

    const keys = Object.keys(safe);
    const values = Object.values(safe);
    const sets = keys.map((k, i) => `${k}=$${i + 2}`).join(", ");

    await query(`UPDATE pricing_plans SET ${sets} WHERE id=$1`, [id, ...values]);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session: any = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });
    await query("DELETE FROM pricing_plans WHERE id=$1", [id]);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
