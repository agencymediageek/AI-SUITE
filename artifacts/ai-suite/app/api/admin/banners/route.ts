import { NextResponse } from "next/server";
import { query } from "@/lib/pg";
import { getSession } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session: any = await getSession();
        if (!session || session.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const res = await query(
            `SELECT * FROM announcement_banners ORDER BY priority DESC, created_at DESC`
        );
        return NextResponse.json(res.rows);
    } catch (error: any) {
        console.error("Error fetching admin banners:", error);
        return NextResponse.json({ error: "Failed to fetch banners" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session: any = await getSession();
        if (!session || session.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const body = await req.json();
        const res = await query(
            `INSERT INTO announcement_banners
               (message, start_date, end_date, bg_gradient, text_color,
                is_enabled, is_dismissible, button_text, button_link, priority)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
             RETURNING *`,
            [
                body.message, body.start_date, body.end_date,
                body.bg_gradient, body.text_color || "#ffffff",
                body.is_enabled ?? true, body.is_dismissible ?? true,
                body.button_text, body.button_link, body.priority || 0,
            ]
        );
        return NextResponse.json(res.rows[0]);
    } catch (error: any) {
        console.error("Error creating banner:", error);
        return NextResponse.json({ error: "Failed to create banner" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const session: any = await getSession();
        if (!session || session.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const body = await req.json();
        const { id, ...updates } = body;
        if (!id) return NextResponse.json({ error: "Banner ID is required" }, { status: 400 });

        const fields = Object.keys(updates);
        const values = Object.values(updates);
        const setClause = fields.map((f, i) => `${f} = $${i + 2}`).join(', ');
        const res = await query(
            `UPDATE announcement_banners SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
            [id, ...values]
        );
        return NextResponse.json(res.rows[0]);
    } catch (error: any) {
        console.error("Error updating banner:", error);
        return NextResponse.json({ error: "Failed to update banner" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session: any = await getSession();
        if (!session || session.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) return NextResponse.json({ error: "Banner ID is required" }, { status: 400 });

        await query('DELETE FROM announcement_banners WHERE id = $1', [id]);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Error deleting banner:", error);
        return NextResponse.json({ error: "Failed to delete banner" }, { status: 500 });
    }
}
