import { NextResponse } from "next/server";
import { z } from "zod";

import { getUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";

const moduleSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const userId = await getUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const course = await prisma.course.findUnique({ where: { id } });
  if (!course || course.teacherId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = moduleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const maxOrder = await prisma.module.findFirst({
    where: { courseId: id },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  const mod = await prisma.module.create({
    data: {
      courseId: id,
      title: parsed.data.title,
      description: parsed.data.description,
      sortOrder: (maxOrder?.sortOrder ?? -1) + 1,
    },
  });

  return NextResponse.json(mod, { status: 201 });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const moduleId = searchParams.get("moduleId");

  if (!moduleId) {
    return NextResponse.json({ error: "Missing moduleId" }, { status: 400 });
  }

  const userId = await getUserId();

  const course = await prisma.course.findUnique({ where: { id } });
  if (!course || course.teacherId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.module.delete({ where: { id: moduleId } });
  return NextResponse.json({ success: true });
}
