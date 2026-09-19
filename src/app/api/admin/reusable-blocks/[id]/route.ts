import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const permError = await requirePermission(user.role, "templates", "delete");
  if (permError) return permError;

  const { id } = await params;

  const existing = await prisma.reusableBlock.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Reusable block not found" }, { status: 404 });
  }

  await prisma.reusableBlock.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
