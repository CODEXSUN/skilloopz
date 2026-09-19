import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";

export async function GET() {
  const user = await getUser();
  if (!user || user.role !== "student") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const userId = user.id;
  const now = new Date();

  const [
    profile,
    enrollments,
    lessonProgresses,
    xpTransactions,
  ] = await Promise.all([
    prisma.profile.findUnique({
      where: { id: userId },
      select: { xp: true, level: true, currentStreak: true, longestStreak: true },
    }),
    prisma.enrollment.findMany({
      where: { userId, archived: false, course: { deletedAt: null } },
      include: {
        course: { select: { id: true, title: true, subject: true } },
      },
    }),
    prisma.lessonProgress.findMany({
      where: { userId },
      select: { status: true, score: true, timeSpent: true, updatedAt: true, createdAt: true, lessonId: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.xPTransaction.findMany({
      where: { userId },
      select: { amount: true, reason: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  type LP = typeof lessonProgresses[number];
  type XP = typeof xpTransactions[number];

  const totalLessons = lessonProgresses.length;
  const completedLessons = lessonProgresses.filter((lp: LP) => lp.status === "completed").length;
  const inProgressLessons = lessonProgresses.filter((lp: LP) => lp.status === "in_progress").length;
  const totalTimeSpent = lessonProgresses.reduce((sum: number, lp: LP) => sum + lp.timeSpent, 0);

  const scored = lessonProgresses.filter((lp: LP) => lp.score != null);
  const avgScore = scored.length > 0
    ? Math.round(scored.reduce((sum: number, lp: LP) => sum + (lp.score ?? 0), 0) / scored.length)
    : 0;

  const totalXp = profile?.xp ?? 0;
  const dailyXp: Record<string, number> = {};
  for (const tx of xpTransactions) {
    const key = tx.createdAt.toISOString().slice(0, 10);
    dailyXp[key] = (dailyXp[key] ?? 0) + tx.amount;
  }
  const dailyXpTrend = Object.entries(dailyXp)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-30)
    .map(([date, amount]) => ({ date, amount }));

  const weeklyActivity: { week: string; completed: number; timeSpent: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
    const weekStart = new Date(weekEnd.getTime() - 7 * 24 * 60 * 60 * 1000);
const weekProgress = lessonProgresses.filter((lp: LP) => {
      const d = lp.updatedAt;
      return d >= weekStart && d < weekEnd;
    });
    weeklyActivity.push({
      week: `W${12 - i}`,
      completed: weekProgress.filter((lp: LP) => lp.status === "completed").length,
      timeSpent: weekProgress.reduce((sum: number, lp: LP) => sum + lp.timeSpent, 0),
    });
    weeklyActivity.push({
      week: `W${12 - i}`,
      completed: weekProgress.filter((lp) => lp.status === "completed").length,
      timeSpent: weekProgress.reduce((sum, lp) => sum + lp.timeSpent, 0),
    });
  }

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

  const xpByReason: Record<string, number> = {};
  for (const tx of xpTransactions) {
    const reason = tx.reason || "other";
    xpByReason[reason] = (xpByReason[reason] ?? 0) + tx.amount;
  }
  const xpBreakdown = Object.entries(xpByReason)
    .sort(([, a], [, b]) => b - a)
    .map(([reason, amount]) => ({ reason, amount }));

  const hoursByDay: Record<string, number> = {};
  for (const lp of lessonProgresses) {
    const key = lp.updatedAt.toISOString().slice(0, 10);
    hoursByDay[key] = (hoursByDay[key] ?? 0) + lp.timeSpent;
  }
  const last28Days: { date: string; minutes: number }[] = [];
  for (let i = 27; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    last28Days.push({ date: key, minutes: Math.round((hoursByDay[key] ?? 0) / 60) });
  }

  const avgQuizScore = lessonProgresses.filter((lp: LP) => lp.score != null).length > 0
    ? Math.round(lessonProgresses.filter((lp: LP) => lp.score != null).reduce((s: number, lp: LP) => s + lp.score!, 0) / lessonProgresses.filter((lp: LP) => lp.score != null).length)
    : null;

  return NextResponse.json({
    overview: {
      totalXp,
      level: profile?.level ?? 1,
      streak: profile?.currentStreak ?? 0,
      longestStreak: profile?.longestStreak ?? 0,
      totalLessons,
      completedLessons,
      inProgressLessons,
      totalTimeSpent: Math.round(totalTimeSpent / 60),
      avgScore,
      avgQuizScore,
      enrolledCourses: enrollments.length,
    },
    dailyXpTrend,
    weeklyActivity,
    scoreDistribution,
    xpBreakdown,
    dailyTimeSpent: last28Days,
    courses: enrollments.map((e) => ({
      id: e.course.id,
      title: e.course.title,
      subject: e.course.subject,
      progress: Math.round(
        (completedLessons > 0 && totalLessons > 0)
          ? (lessonProgresses.filter((lp) => lp.status === "completed").length / totalLessons) * 100
          : 0
      ),
    })),
  });
}

export type StudentAnalyticsData = {
  overview: {
    totalXp: number;
    level: number;
    streak: number;
    longestStreak: number;
    totalLessons: number;
    completedLessons: number;
    inProgressLessons: number;
    totalTimeSpent: number;
    avgScore: number;
    avgQuizScore: number | null;
    enrolledCourses: number;
  };
  dailyXpTrend: { date: string; amount: number }[];
  weeklyActivity: { week: string; completed: number; timeSpent: number }[];
  scoreDistribution: { range: string; count: number }[];
  xpBreakdown: { reason: string; amount: number }[];
  dailyTimeSpent: { date: string; minutes: number }[];
  courses: { id: string; title: string; subject: string | null; progress: number }[];
};
