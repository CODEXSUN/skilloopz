import { NextResponse } from "next/server";

import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const user = await getUser();
    if (!user || !user.schoolId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const students = await prisma.profile.findMany({
      where: {
        schoolId: user.schoolId,
        role: "student",
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        xp: true,
        level: true,
        currentStreak: true,
        status: true,
      },
      orderBy: { xp: "desc" },
    });

    const studentIds = students.map((s) => s.id);

    const [enrollCounts, lessonCounts] = await Promise.all([
      prisma.enrollment.groupBy({
        by: ["userId"],
        where: { userId: { in: studentIds } },
        _count: { id: true },
      }),
      prisma.lessonProgress.groupBy({
        by: ["userId"],
        where: { userId: { in: studentIds }, status: "completed" },
        _count: { id: true },
      }),
    ]);

    const enrollMap = new Map(enrollCounts.map((e) => [e.userId, e._count.id]));
    const lessonMap = new Map(lessonCounts.map((l) => [l.userId, l._count.id]));

    const studentsWithData = students.map((s) => ({
      ...s,
      enrolledCourses: enrollMap.get(s.id) ?? 0,
      completedLessons: lessonMap.get(s.id) ?? 0,
    }));

    return NextResponse.json({ students: studentsWithData });
  } catch (error) {
    console.error("School students fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}
