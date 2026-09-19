import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import { createAuditLog } from "@/lib/audit-log";
import { ensureDefaultRoles } from "@/lib/roles";

const createSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  permissions: z.string().optional().default("{}"),
  isBuiltIn: z.boolean().optional().default(false),
});

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const permError = await requirePermission(user.role, "roles", "read");
  if (permError) return permError;

  await ensureDefaultRoles();

  const roles = await prisma.role.findMany({
    orderBy: [{ isBuiltIn: "desc" }, { createdAt: "asc" }],
  });

  return NextResponse.json(roles);
}

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const permError = await requirePermission(user.role, "roles", "create");
  if (permError) return permError;

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { name, description, permissions, isBuiltIn } = parsed.data;

  const existing = await prisma.role.findUnique({ where: { name } });
  if (existing) {
    return NextResponse.json({ error: "A role with this name already exists" }, { status: 409 });
  }

  const role = await prisma.role.create({
    data: { name, description, permissions, isBuiltIn },
  });

  await createAuditLog({
    action: "create",
    resource: "role",
    resourceId: role.id,
    userId: user.id,
    details: { name: role.name },
  });

  return NextResponse.json(role, { status: 201 });
}
