import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { getMarketplaceApps, createMarketplaceApp } from "@/lib/marketplace-apps";
import { createAuditLog } from "@/lib/audit-log";

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const apps = await getMarketplaceApps();
  return NextResponse.json(apps);
}

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { name, description, developer, developerUrl, iconUrl, category, tags, version, configSchema, webhookUrl } = body;

  if (!name || !description || !developer) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const app = await createMarketplaceApp({ name, description, developer, developerUrl, iconUrl, category, tags, version, configSchema, webhookUrl });

  await createAuditLog({
    action: "create",
    resource: "marketplace_app",
    resourceId: app.id,
    userId: user.id,
    details: { name, developer },
  });

  return NextResponse.json(app, { status: 201 });
}
