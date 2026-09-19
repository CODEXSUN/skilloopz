import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserId } from "@/lib/auth";

export async function GET(request: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";
  const sortBy = searchParams.get("sort") ?? "name";
  const order = searchParams.get("order") ?? "asc";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10)));
  const skip = (page - 1) * limit;

  const enrollments = await prisma.enrollment.findMany({
    where: { course: { teacherId: userId, deletedAt: null } },
    include: {
      user: {
        select: { id: true, fullName: true, email: true, avatarUrl: true },
      },
      course: { select: { title: true } },
    },
  });

  const studentMap = new Map<string, {
    id: string;
    fullName: string | null;
    email: string | null;
    avatarUrl: string | null;
    courseCount: number;
    courses: string[];
    lastActivity: Date | null;
    scores: number[];
  }>();

  for (const e of enrollments) {
    if (!studentMap.has(e.userId)) {
      studentMap.set(e.userId, {
        id: e.user.id,
        fullName: e.user.fullName,
        email: e.user.email,
        avatarUrl: e.user.avatarUrl,
        courseCount: 0,
        courses: [],
        lastActivity: null,
        scores: [],
      });
    }
    const s = studentMap.get(e.userId)!;
    s.courseCount++;
    s.courses.push(e.course.title);
    if (!s.lastActivity || e.updatedAt > s.lastActivity) {
      s.lastActivity = e.updatedAt;
    }
  }

  const studentIds = Array.from(studentMap.keys());

  const lessonProgresses = await prisma.lessonProgress.findMany({
    where: { userId: { in: studentIds } },
    select: { userId: true, score: true },
  });

  for (const lp of lessonProgresses) {
    const s = studentMap.get(lp.userId);
    if (s && lp.score != null) {
      s.scores.push(lp.score);
    }
  }

  let students = Array.from(studentMap.values());

  if (query) {
    const lower = query.toLowerCase();
    students = students.filter(
      (s) =>
        (s.fullName ?? "").toLowerCase().includes(lower) ||
        (s.email ?? "").toLowerCase().includes(lower),
    );
  }

  const total = students.length;

  if (sortBy === "name") {
    students.sort((a, b) => order === "asc"
      ? (a.fullName ?? "").localeCompare(b.fullName ?? "")
      : (b.fullName ?? "").localeCompare(a.fullName ?? ""));
  } else if (sortBy === "courses") {
    students.sort((a, b) => order === "asc" ? a.courseCount - b.courseCount : b.courseCount - a.courseCount);
  } else if (sortBy === "activity") {
    students.sort((a, b) => order === "desc"
      ? ((b.lastActivity?.getTime() ?? 0) - (a.lastActivity?.getTime() ?? 0))
      : ((a.lastActivity?.getTime() ?? 0) - (b.lastActivity?.getTime() ?? 0)));
  } else if (sortBy === "score") {
    students.sort((a, b) => {
      const avgA = a.scores.length > 0 ? a.scores.reduce((sum, s) => sum + s, 0) / a.scores.length : 0;
      const avgB = b.scores.length > 0 ? b.scores.reduce((sum, s) => sum + s, 0) / b.scores.length : 0;
      return order === "desc" ? avgB - avgA : avgA - avgB;
    });
  }

  const paged = students.slice(skip, skip + limit).map((s) => ({
    id: s.id,
    fullName: s.fullName,
    email: s.email,
    avatarUrl: s.avatarUrl,
    courseCount: s.courseCount,
    courses: s.courses,
    lastActivity: s.lastActivity?.toISOString() ?? null,
    avgScore: s.scores.length > 0 ? Math.round(s.scores.reduce((sum, sc) => sum + sc, 0) / s.scores.length) : null,
  }));

  return NextResponse.json({
    students: paged,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}
