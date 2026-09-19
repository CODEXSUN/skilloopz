import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import { getCdnConfig, saveCdnConfig } from "@/lib/cdn";
import { createAuditLog } from "@/lib/audit-log";

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const permError = await requirePermission(user.role, "settings", "read");
  if (permError) return permError;

  const config = await getCdnConfig();
  return NextResponse.json(config);
}

export async function PUT(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const permError = await requirePermission(user.role, "settings", "update");
  if (permError) return permError;

  const body = await request.json();
  const { enabled, url, mediaPrefix, staticAssetsPrefix } = body;

  if (enabled && !url) {
    return NextResponse.json({ error: "CDN URL is required when enabled" }, { status: 400 });
  }

  try {
    if (url) new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid CDN URL" }, { status: 400 });
  }

  await saveCdnConfig({ enabled, url, mediaPrefix, staticAssetsPrefix });

  await createAuditLog({
    action: "update",
    resource: "cdn",
    userId: user.id,
    details: { enabled, url },
  });

  return NextResponse.json({ success: true });
}
