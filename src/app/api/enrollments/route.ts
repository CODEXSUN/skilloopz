import { NextResponse } from "next/server";
import { z } from "zod";

import { getUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";

const enrollSchema = z.object({
  courseId: z.string().uuid(),
});

export async function GET() {
  const userId = await getUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const enrollments = await prisma.enrollment.findMany({
    where: { userId, course: { deletedAt: null } },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          thumbnailUrl: true,
          difficulty: true,
          estimatedMinutes: true,
          teacher: { select: { fullName: true } },
          _count: { select: { modules: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(enrollments);
}

export async function POST(request: Request) {
  const userId = await getUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = enrollSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId: parsed.data.courseId } },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Already enrolled in this course" },
      { status: 409 },
    );
  }

  const enrollment = await prisma.enrollment.create({
    data: {
      userId,
      courseId: parsed.data.courseId,
      progress: 0,
    },
  });

  return NextResponse.json(enrollment, { status: 201 });
}
