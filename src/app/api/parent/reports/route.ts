import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";

const querySchema = z.object({
  childId: z.string(),
  days: z.coerce.number().int().min(1).max(90).optional().default(14),
});

export async function GET(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "parent") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  const { childId, days } = parsed.data;

  const child = await prisma.profile.findFirst({
    where: { id: childId, parentId: user.id },
    select: {
      id: true,
      fullName: true,
      email: true,
      xp: true,
      level: true,
      currentStreak: true,
      longestStreak: true,
      lastActivityDate: true,
    },
  });

  if (!child) {
    return NextResponse.json({ error: "Child not found" }, { status: 404 });
  }

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [xpTransactions, enrollments, completedLessons, recentActivity] = await Promise.all([
    prisma.xPTransaction.findMany({
      where: { userId: childId, createdAt: { gte: since } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.enrollment.findMany({
      where: { userId: childId },
      include: {
        course: {
          select: { id: true, title: true, subject: true, difficulty: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.lessonProgress.findMany({
      where: { userId: childId, status: "completed" },
      orderBy: { updatedAt: "desc" },
      take: 50,
      include: {
        lesson: {
          select: { id: true, title: true, module: { select: { courseId: true } } },
        },
      },
    }),
    prisma.lessonProgress.findMany({
      where: { userId: childId, updatedAt: { gte: since } },
      orderBy: { updatedAt: "desc" },
      take: 20,
      include: {
        lesson: {
          select: { id: true, title: true },
        },
      },
    }),
  ]);

  const weeklyXp = (() => {
    const dayMap: Record<string, number> = {};
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      dayMap[key] = 0;
    }
    for (const tx of xpTransactions) {
      const key = new Date(tx.createdAt).toISOString().slice(0, 10);
      if (key in dayMap) dayMap[key] += tx.amount;
    }
    return Object.entries(dayMap).map(([date, xp]) => ({ date, xp }));
  })();

  const coursesWithProgress = enrollments.map((enr) => {
    const courseLessons = completedLessons.filter(
      (lp) => lp.lesson.module.courseId === enr.course.id,
    );
    const courseTimeSpent = courseLessons.reduce((sum, lp) => sum + lp.timeSpent, 0);
    const courseQuizzes = courseLessons.filter((lp) => lp.score !== null);
    const avgQuizScore = courseQuizzes.length > 0
      ? courseQuizzes.reduce((sum, lp) => sum + (lp.score ?? 0), 0) / courseQuizzes.length
      : null;
    return {
      id: enr.course.id,
      title: enr.course.title,
      subject: enr.course.subject,
      difficulty: enr.course.difficulty,
      progress: enr.progress,
      completedLessons: courseLessons.length,
      completed: enr.completed,
      timeSpent: courseTimeSpent,
      avgQuizScore,
    };
  });

  const weakSubjects = (() => {
    const subjectScores: Record<string, number[]> = {};
    for (const lp of completedLessons) {
      if (lp.score !== null) {
        const course = enrollments.find((e) => {
          const courseLessons = completedLessons.filter(
            (cl) => cl.lesson.module.courseId === e.course.id,
          );
          return courseLessons.includes(lp);
        });
        if (course?.course.subject) {
          const subject = course.course.subject;
          if (!subjectScores[subject]) subjectScores[subject] = [];
          subjectScores[subject].push(lp.score);
        }
      }
    }
    return Object.entries(subjectScores)
      .map(([subject, scores]) => ({
        subject,
        avgScore: scores.reduce((a, b) => a + b, 0) / scores.length,
        quizCount: scores.length,
      }))
      .filter((s) => s.avgScore < 70)
      .sort((a, b) => a.avgScore - b.avgScore);
  })();

  const totalTimeSpent = completedLessons.reduce((sum, lp) => sum + lp.timeSpent, 0);

  const onTrack = (() => {
    const daysSinceStart = child.lastActivityDate
      ? Math.max(1, Math.ceil((Date.now() - new Date(child.lastActivityDate).getTime()) / (1000 * 60 * 60 * 24)))
      : 1;
    const lessonsPerDay = completedLessons.length / Math.max(1, daysSinceStart);
    const expectedRate = 0.5;
    return {
      isOnTrack: lessonsPerDay >= expectedRate || child.currentStreak >= 3,
      lessonsPerDay: Math.round(lessonsPerDay * 10) / 10,
      expectedRate,
      streakHealthy: child.currentStreak >= 3,
    };
  })();

  const recentActivityItems = recentActivity.map((lp) => ({
    id: lp.id,
    lessonTitle: lp.lesson.title,
    status: lp.status,
    score: lp.score,
    timestamp: lp.updatedAt,
  }));

  return NextResponse.json({
    child: {
      id: child.id,
      fullName: child.fullName,
      email: child.email,
      xp: child.xp,
      level: child.level,
      currentStreak: child.currentStreak,
      longestStreak: child.longestStreak,
      lastActivityDate: child.lastActivityDate,
    },
    weeklyXp,
    courses: coursesWithProgress,
    totalCompletedLessons: completedLessons.length,
    totalTimeSpent,
    recentActivity: recentActivityItems,
    weakSubjects,
    onTrack,
  });
}
