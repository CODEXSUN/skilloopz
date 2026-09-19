import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const permError = await requirePermission(user.role, "settings", "update");
  if (permError) return permError;

  const { id } = await params;
  const body = await request.json();

  const log = await prisma.errorLog.update({
    where: { id },
    data: { resolved: body.resolved ?? false },
  });

  return NextResponse.json(log);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const permError = await requirePermission(user.role, "settings", "delete");
  if (permError) return permError;

  const { id } = await params;
  await prisma.errorLog.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
