import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";

export async function GET() {
  const user = await getUser();
  if (!user || user.role !== "teacher") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const teacherId = user.id;
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const [courses, enrollments, lessonProgresses, xpTransactions] = await Promise.all([
    prisma.course.findMany({
      where: { teacherId },
      include: { _count: { select: { enrollments: true, modules: true } } },
    }),
    prisma.enrollment.findMany({
      where: { course: { teacherId } },
      include: { course: { select: { title: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.lessonProgress.findMany({
      where: { lesson: { module: { course: { teacherId } } } },
      select: { status: true, score: true, timeSpent: true, lessonId: true, userId: true, updatedAt: true },
    }),
    prisma.xPTransaction.findMany({
      where: {
        user: {
          enrollments: { some: { course: { teacherId } } },
        },
      },
      select: { userId: true, createdAt: true },
    }),
  ]);

  const activeCourses = courses.filter((c) => c.status === "published").length;
  const activeStudents = new Set(enrollments.map((e) => e.userId)).size;

  const completed = lessonProgresses.filter((lp) => lp.status === "completed").length;
  const total = lessonProgresses.length;
  const avgCompletion = total > 0 ? Math.round((completed / total) * 100) : 0;

  const scored = lessonProgresses.filter((lp) => lp.score != null);
  const avgScore =
    scored.length > 0
      ? Math.round(scored.reduce((sum, lp) => sum + (lp.score ?? 0), 0) / scored.length)
      : 0;

  const enrollmentsByMonth: Record<string, number> = {};
  for (const e of enrollments) {
    const key = e.createdAt.toISOString().slice(0, 7);
    enrollmentsByMonth[key] = (enrollmentsByMonth[key] ?? 0) + 1;
  }
  const enrollmentTrend = Object.entries(enrollmentsByMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({ month, count }));

  const funnel = {
    enrolled: enrollments.length,
    started: lessonProgresses.filter((lp) => lp.status !== "not_started").length,
    inProgress: lessonProgresses.filter((lp) => lp.status === "in_progress").length,
    completed,
  };

  const scoreRanges = [0, 0, 0, 0, 0];
  for (const lp of scored) {
    const score = lp.score ?? 0;
    if (score < 20) scoreRanges[0]++;
    else if (score < 40) scoreRanges[1]++;
    else if (score < 60) scoreRanges[2]++;
    else if (score < 80) scoreRanges[3]++;
    else scoreRanges[4]++;
  }
  const scoreDistribution = [
    { range: "0-20%", count: scoreRanges[0] },
    { range: "20-40%", count: scoreRanges[1] },
    { range: "40-60%", count: scoreRanges[2] },
    { range: "60-80%", count: scoreRanges[3] },
    { range: "80-100%", count: scoreRanges[4] },
  ];

  const dropoffCounts: Record<string, number> = {};
  for (const lp of lessonProgresses) {
    dropoffCounts[lp.lessonId] = (dropoffCounts[lp.lessonId] ?? 0) + 1;
  }
  const dropOffPoints = Object.entries(dropoffCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([lessonId, count]) => ({ lessonId, count }));

  // Retention: students active in last 30 days who were also active in prior 30 days
  const last30DaysUsers = new Set(
    lessonProgresses
      .filter((lp) => lp.updatedAt >= thirtyDaysAgo)
      .map((lp) => lp.userId)
  );
  const prior30DaysUsers = new Set(
    lessonProgresses
      .filter((lp) => lp.updatedAt >= sixtyDaysAgo && lp.updatedAt < thirtyDaysAgo)
      .map((lp) => lp.userId)
  );
  const retainedUsers = [...prior30DaysUsers].filter((u) => last30DaysUsers.has(u));
  const retentionRate = prior30DaysUsers.size > 0
    ? Math.round((retainedUsers.length / prior30DaysUsers.size) * 100)
    : 0;

  // Weekly retention for the last 8 weeks
  const weeklyRetention: { week: string; active: number; retained: number; rate: number }[] = [];
  for (let i = 7; i >= 0; i--) {
    const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
    const weekStart = new Date(weekEnd.getTime() - 7 * 24 * 60 * 60 * 1000);
    const prevWeekEnd = new Date(weekStart.getTime());
    const prevWeekStart = new Date(prevWeekEnd.getTime() - 7 * 24 * 60 * 60 * 1000);

    const weekUsers = new Set(
      lessonProgresses
        .filter((lp) => lp.updatedAt >= weekStart && lp.updatedAt < weekEnd)
        .map((lp) => lp.userId)
    );
    const prevWeekUsers = new Set(
      lessonProgresses
        .filter((lp) => lp.updatedAt >= prevWeekStart && lp.updatedAt < prevWeekEnd)
        .map((lp) => lp.userId)
    );
    const retained = [...prevWeekUsers].filter((u) => weekUsers.has(u)).length;
    const rate = prevWeekUsers.size > 0 ? Math.round((retained / prevWeekUsers.size) * 100) : 0;

    weeklyRetention.push({
      week: `W${8 - i}`,
      active: weekUsers.size,
      retained,
      rate,
    });
  }

  // Engagement: composite score per week (time spent + completions + unique active students)
  const weeklyEngagement: { week: string; timeSpent: number; completions: number; activeStudents: number; score: number }[] = [];
  for (let i = 7; i >= 0; i--) {
    const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
    const weekStart = new Date(weekEnd.getTime() - 7 * 24 * 60 * 60 * 1000);

    const weekProgress = lessonProgresses.filter((lp) => lp.updatedAt >= weekStart && lp.updatedAt < weekEnd);
    const timeSpent = weekProgress.reduce((sum, lp) => sum + lp.timeSpent, 0);
    const completions = weekProgress.filter((lp) => lp.status === "completed").length;
    const activeStudentsCount = new Set(weekProgress.map((lp) => lp.userId)).size;

    // Normalized engagement score (0-100 scale)
    const timeScore = Math.min(100, (timeSpent / 3600) * 10); // 10 hours = 100
    const completionScore = Math.min(100, completions * 5); // 20 completions = 100
    const studentScore = Math.min(100, (activeStudentsCount / Math.max(activeStudents, 1)) * 100);
    const engagementScore = Math.round(timeScore * 0.4 + completionScore * 0.35 + studentScore * 0.25);

    weeklyEngagement.push({
      week: `W${8 - i}`,
      timeSpent,
      completions,
      activeStudents: activeStudentsCount,
      score: engagementScore,
    });
  }

  // Overall engagement metrics
  const totalTimeSpent = lessonProgresses.reduce((sum, lp) => sum + lp.timeSpent, 0);
  const avgTimePerStudent = activeStudents > 0 ? Math.round(totalTimeSpent / activeStudents) : 0;
  const studentsWithActivity = new Set(
    lessonProgresses.filter((lp) => lp.updatedAt >= thirtyDaysAgo).map((lp) => lp.userId)
  ).size;
  const engagementRate = activeStudents > 0 ? Math.round((studentsWithActivity / activeStudents) * 100) : 0;

  return NextResponse.json({
    overview: { activeCourses, activeStudents, avgCompletion, avgScore, totalCourses: courses.length },
    enrollmentTrend,
    funnel: [funnel],
    scoreDistribution,
    dropOffPoints,
    courses: courses.map((c) => ({
      id: c.id,
      title: c.title,
      status: c.status,
      enrollments: c._count.enrollments,
      modules: c._count.modules,
    })),
    retention: {
      rate: retentionRate,
      priorPeriodUsers: prior30DaysUsers.size,
      retainedUsers: retainedUsers.length,
      weekly: weeklyRetention,
    },
    engagement: {
      rate: engagementRate,
      totalTimeSpent,
      avgTimePerStudent,
      activeThisPeriod: studentsWithActivity,
      weekly: weeklyEngagement,
    },
  });
}

export type AnalyticsData = {
  overview: {
    activeCourses: number;
    activeStudents: number;
    avgCompletion: number;
    avgScore: number;
    totalCourses: number;
  };
  enrollmentTrend: { month: string; count: number }[];
  funnel: { enrolled: number; started: number; inProgress: number; completed: number }[];
  scoreDistribution: { range: string; count: number }[];
  dropOffPoints: { lessonId: string; count: number }[];
  courses: { id: string; title: string; status: string; enrollments: number; modules: number }[];
  retention: {
    rate: number;
    priorPeriodUsers: number;
    retainedUsers: number;
    weekly: { week: string; active: number; retained: number; rate: number }[];
  };
  engagement: {
    rate: number;
    totalTimeSpent: number;
    avgTimePerStudent: number;
    activeThisPeriod: number;
    weekly: { week: string; timeSpent: number; completions: number; activeStudents: number; score: number }[];
  };
};
