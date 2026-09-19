import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { getSsoProvider, updateSsoProvider, deleteSsoProvider } from "@/lib/sso";
import { createAuditLog } from "@/lib/audit-log";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const provider = await getSsoProvider(id);
  if (!provider) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(provider);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await request.json();
  const { name, providerType, clientId, clientSecret, issuerUrl, enabled, buttonLabel } = body;

  const existing = await getSsoProvider(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updateData: Record<string, unknown> = {};
  if (name !== undefined) updateData.name = name;
  if (providerType !== undefined) updateData.providerType = providerType;
  if (clientId !== undefined) updateData.clientId = clientId;
  if (clientSecret !== undefined) updateData.clientSecret = clientSecret;
  if (issuerUrl !== undefined) updateData.issuerUrl = issuerUrl;
  if (enabled !== undefined) updateData.enabled = enabled;
  if (buttonLabel !== undefined) updateData.buttonLabel = buttonLabel;

  const updated = await updateSsoProvider(id, updateData);

  await createAuditLog({
    action: "update",
    resource: "sso",
    resourceId: id,
    userId: user.id,
    details: { changes: Object.keys(updateData) },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const existing = await getSsoProvider(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await deleteSsoProvider(id);

  await createAuditLog({
    action: "delete",
    resource: "sso",
    resourceId: id,
    userId: user.id,
    details: { name: existing.name, providerType: existing.providerType },
  });

  return NextResponse.json({ success: true });
}
