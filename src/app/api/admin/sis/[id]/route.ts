import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { getSisConfig, updateSisConfig, deleteSisConfig } from "@/lib/sis";
import { createAuditLog } from "@/lib/audit-log";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const config = await getSisConfig(id);
  if (!config) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(config);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await request.json();

  const existing = await getSisConfig(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await updateSisConfig(id, body);

  await createAuditLog({
    action: "update",
    resource: "sis",
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
  const existing = await getSisConfig(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await deleteSisConfig(id);

  await createAuditLog({
    action: "delete",
    resource: "sis",
    resourceId: id,
    userId: user.id,
    details: { name: existing.name },
  });

  return NextResponse.json({ success: true });
}
