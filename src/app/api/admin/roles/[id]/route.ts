import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit-log";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  permissions: z.string().optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const role = await prisma.role.findUnique({ where: { id } });
  if (!role) return NextResponse.json({ error: "Role not found" }, { status: 404 });

  return NextResponse.json(role);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  const existing = await prisma.role.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Role not found" }, { status: 404 });
  if (existing.isBuiltIn) return NextResponse.json({ error: "Cannot modify built-in role" }, { status: 403 });

  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) data.name = parsed.data.name;
  if (parsed.data.description !== undefined) data.description = parsed.data.description;
  if (parsed.data.permissions !== undefined) data.permissions = parsed.data.permissions;

  if (data.name && data.name !== existing.name) {
    const nameExists = await prisma.role.findUnique({ where: { name: data.name as string } });
    if (nameExists && nameExists.id !== id) {
      return NextResponse.json({ error: "A role with this name already exists" }, { status: 409 });
    }
  }

  const role = await prisma.role.update({
    where: { id },
    data,
  });

  const changedFields = Object.keys(data);
  await createAuditLog({
    action: changedFields.includes("permissions") ? "permission_change" : "update",
    resource: "role",
    resourceId: role.id,
    userId: user.id,
    details: { name: role.name, changedFields },
  });

  return NextResponse.json(role);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  const existing = await prisma.role.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Role not found" }, { status: 404 });
  if (existing.isBuiltIn) return NextResponse.json({ error: "Cannot delete built-in role" }, { status: 403 });

  const profilesUsingRole = await prisma.profile.count({ where: { role: existing.name } });
  if (profilesUsingRole > 0) {
    return NextResponse.json({
      error: `Cannot delete role "${existing.name}": ${profilesUsingRole} user(s) are assigned this role`,
    }, { status: 409 });
  }

  await prisma.role.delete({ where: { id } });

  return new NextResponse(null, { status: 204 });
}
