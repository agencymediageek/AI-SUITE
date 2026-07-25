import { NextResponse } from "next/server";
import { query } from "@/lib/pg";

// This endpoint verifies that the i18n tables exist in PostgreSQL.
// With our PostgreSQL migration, these tables are already created via schema.sql.

export async function POST() {
    try {
        // Verify both tables exist and are accessible
        await query('SELECT 1 FROM languages LIMIT 1');
        await query('SELECT 1 FROM translations LIMIT 1');
        return NextResponse.json({ success: true, message: "i18n tables are ready (PostgreSQL)" });
    } catch (error: any) {
        return NextResponse.json({
            error: "i18n tables not found. Run the database migration.",
            details: error.message
        }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({
        info: "i18n tables are managed by PostgreSQL. Run schema.sql to initialize."
    });
}
