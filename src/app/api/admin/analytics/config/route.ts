import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { getAnalyticsConfig, saveAnalyticsConfig } from "@/lib/analytics";
import { createAuditLog } from "@/lib/audit-log";

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const config = await getAnalyticsConfig();
  return NextResponse.json(config);
}

export async function PUT(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { enabled, ga4Id, mixpanelToken } = body;

  await saveAnalyticsConfig({ enabled, ga4Id, mixpanelToken });

  await createAuditLog({
    action: "update",
    resource: "settings",
    userId: user.id,
    details: { analytics: { enabled } },
  });

  return NextResponse.json({ success: true });
}
