import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const lesson = await prisma.lesson.findFirst({
    where: { id, deletedAt: null },
    include: {
      module: {
        select: {
          id: true,
          title: true,
          courseId: true,
          course: { select: { title: true } },
        },
      },
    },
  });

  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  return NextResponse.json(lesson);
}
