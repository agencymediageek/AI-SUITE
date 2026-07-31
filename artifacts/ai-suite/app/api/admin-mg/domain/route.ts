import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function GET(_req: NextRequest) {
  const session: any = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  let domain = "";
  try {
    domain = new URL(appUrl).hostname;
  } catch {
    domain = appUrl;
  }

  let sslStatus = { valid: false, expiry: null as string | null, daysLeft: null as number | null };
  try {
    const certPath = `/etc/letsencrypt/live/${domain}/cert.pem`;
    const { stdout } = await execAsync(`openssl x509 -enddate -noout -in ${certPath}`);
    const dateStr = stdout.replace("notAfter=", "").trim();
    const expiry = new Date(dateStr);
    const now = new Date();
    const daysLeft = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    sslStatus = { valid: true, expiry: expiry.toISOString(), daysLeft };
  } catch {
    // cert not found or openssl failed — not fatal
  }

  return NextResponse.json({
    domain,
    appUrl,
    pm2Process: process.env.PM2_PROCESS_NAME || "unknown",
    ssl: sslStatus,
  });
}

export async function POST(req: NextRequest) {
  const session: any = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { action } = await req.json();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  let domain = "";
  try {
    domain = new URL(appUrl).hostname;
  } catch {
    return NextResponse.json({ error: "NEXT_PUBLIC_APP_URL inválido" }, { status: 400 });
  }

  if (action === "renew-ssl") {
    try {
      const { stdout } = await execAsync(`certbot renew --cert-name ${domain} --non-interactive 2>&1`);
      return NextResponse.json({ success: true, output: stdout });
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Ação desconhecida" }, { status: 400 });
}
