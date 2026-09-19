import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { getPlugin, updatePlugin, deletePlugin } from "@/lib/plugins";
import { createAuditLog } from "@/lib/audit-log";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { slug } = await params;
  const plugin = await getPlugin(slug);
  if (!plugin) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(plugin);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { slug } = await params;
  const body = await request.json();

  const existing = await getPlugin(slug);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await updatePlugin(slug, body);

  await createAuditLog({
    action: "update",
    resource: "plugin",
    resourceId: slug,
    userId: user.id,
    details: { changes: Object.keys(body) },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { slug } = await params;
  const existing = await getPlugin(slug);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await deletePlugin(slug);

  await createAuditLog({
    action: "delete",
    resource: "plugin",
    resourceId: slug,
    userId: user.id,
    details: { name: existing.name },
  });

  return NextResponse.json({ success: true });
}
