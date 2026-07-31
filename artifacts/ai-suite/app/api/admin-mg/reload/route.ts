import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function POST(_req: NextRequest) {
  const session: any = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const processName = process.env.PM2_PROCESS_NAME;
  if (!processName) {
    return NextResponse.json(
      { error: "PM2_PROCESS_NAME não configurado no .env.local" },
      { status: 400 }
    );
  }

  try {
    const { stdout, stderr } = await execAsync(`pm2 reload ${processName}`);
    return NextResponse.json({
      success: true,
      message: `Processo '${processName}' recarregado`,
      output: stdout || stderr,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
