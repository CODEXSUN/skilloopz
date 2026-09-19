import { NextResponse } from "next/server";

import { getUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const course = await prisma.course.findFirst({
    where: { id, deletedAt: null },
    include: {
      category: { select: { name: true } },
      tags: { select: { tag: { select: { name: true } } } },
      modules: {
        orderBy: { sortOrder: "asc" },
        include: {
          lessons: {
            orderBy: { sortOrder: "asc" },
            select: {
              title: true,
              description: true,
              sortOrder: true,
              content: true,
              estimatedMinutes: true,
            },
          },
        },
      },
    },
  });

  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  if (course.teacherId !== userId) {
    const profile = await prisma.profile.findUnique({ where: { id: userId }, select: { role: true } });
    if (!profile || (profile.role !== "admin" && profile.role !== "superadmin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const exportData = {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    course: {
      title: course.title,
      description: course.description,
      subject: course.subject,
      gradeLevel: course.gradeLevel,
      ageRange: course.ageRange,
      difficulty: course.difficulty,
      estimatedMinutes: course.estimatedMinutes,
      category: course.category?.name ?? null,
      tags: course.tags.map((ct) => ct.tag.name),
      modules: course.modules.map((mod) => ({
        title: mod.title,
        description: mod.description,
        sortOrder: mod.sortOrder,
        lessons: mod.lessons.map((lesson) => ({
          title: lesson.title,
          description: lesson.description,
          sortOrder: lesson.sortOrder,
          content: lesson.content,
          estimatedMinutes: lesson.estimatedMinutes,
        })),
      })),
    },
  };

  const filename = `${course.title.replace(/[^a-zA-Z0-9]/g, "_")}_export.json`;

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
