import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { getEmailConfig, saveEmailConfig } from "@/lib/email";
import { createAuditLog } from "@/lib/audit-log";

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const config = await getEmailConfig();
  return NextResponse.json(config);
}

export async function PUT(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { enabled, provider, apiKey, fromEmail, fromName } = body;

  if (provider && !["sendgrid", "smtp"].includes(provider)) {
    return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
  }

  await saveEmailConfig({ enabled, provider, apiKey, fromEmail, fromName });

  await createAuditLog({
    action: "update",
    resource: "settings",
    userId: user.id,
    details: { email: { provider: provider || "sendgrid", enabled: !!enabled } },
  });

  return NextResponse.json({ success: true });
}
