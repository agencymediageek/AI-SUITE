import { NextResponse } from "next/server";
import { query } from "@/lib/pg";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const now = new Date().toISOString();
        const res = await query(
            `SELECT * FROM announcement_banners
             WHERE is_enabled = true
               AND start_date <= $1
               AND end_date >= $1
             ORDER BY priority DESC, created_at DESC
             LIMIT 1`,
            [now]
        );
        return NextResponse.json(res.rows[0] || null);
    } catch (error: any) {
        console.error("Error fetching public banner:", error);
        return NextResponse.json(null);
    }
}
