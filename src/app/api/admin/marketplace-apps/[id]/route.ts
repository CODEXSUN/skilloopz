import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { getMarketplaceApp, updateMarketplaceApp, deleteMarketplaceApp } from "@/lib/marketplace-apps";
import { createAuditLog } from "@/lib/audit-log";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const app = await getMarketplaceApp(id);
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(app);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await request.json();

  const existing = await getMarketplaceApp(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await updateMarketplaceApp(id, body);

  await createAuditLog({
    action: "update",
    resource: "marketplace_app",
    resourceId: id,
    userId: user.id,
    details: { changes: Object.keys(body) },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const existing = await getMarketplaceApp(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await deleteMarketplaceApp(id);

  await createAuditLog({
    action: "delete",
    resource: "marketplace_app",
    resourceId: id,
    userId: user.id,
    details: { name: existing.name },
  });

  return NextResponse.json({ success: true });
}
