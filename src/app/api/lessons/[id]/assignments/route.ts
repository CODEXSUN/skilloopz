import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: {
      module: {
        include: {
          course: { select: { teacherId: true } },
        },
      },
    },
  });

  if (!lesson) return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  if (lesson.module.course.teacherId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const submissions = await prisma.assignmentSubmission.findMany({
    where: { lessonId: id },
    include: {
      user: {
        select: { id: true, fullName: true, email: true, avatarUrl: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ submissions });
}
