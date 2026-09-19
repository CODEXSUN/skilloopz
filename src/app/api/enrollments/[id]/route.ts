import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const archived = body.archived as boolean | undefined;
  if (typeof archived !== "boolean") {
    return NextResponse.json({ error: "archived must be a boolean" }, { status: 400 });
  }

  const enrollment = await prisma.enrollment.findUnique({ where: { id } });
  if (!enrollment || enrollment.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.enrollment.update({
    where: { id },
    data: { archived },
  });

  return NextResponse.json({ success: true });
}
