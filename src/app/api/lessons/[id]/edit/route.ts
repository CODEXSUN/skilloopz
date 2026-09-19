import { NextResponse } from "next/server";
import { z } from "zod";

import { getUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";

const updateLessonSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  content: z.string().optional(),
  estimatedMinutes: z.number().int().positive().optional(),
  status: z.enum(["draft", "published"]).optional(),
  sortOrder: z.number().int().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const userId = await getUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: {
      module: { select: { courseId: true } },
    },
  });

  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  const course = await prisma.course.findUnique({
    where: { id: lesson.module.courseId },
    select: { teacherId: true },
  });

  if (!course || course.teacherId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = updateLessonSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const updated = await prisma.lesson.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json(updated);
}
