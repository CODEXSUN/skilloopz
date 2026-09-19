import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";

export async function GET() {
  const user = await getUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    roleCounts,
    totalCourses,
    statusCounts,
    totalEnrollments,
    totalCompletedLessons,
    recentProfiles,
    recentXpTransactions,
    topCourses,
    mauUsers,
    lastMonthUsers,
    retainedUsers,
    totalTimeSpent,
    weeklyActiveUsers,
    // Retention cohorts
    week1Profiles,
    week2Profiles,
    week3Profiles,
    week4Profiles,
    // Platform usage
    activeTeachers,
    activeParents,
    enrollmentsByRole,
    courseCompletionRates,
    // Revenue
    totalRevenue,
    totalPlatformFees,
    totalPayouts,
    coursePerformance,
  ] = await Promise.all([
    prisma.profile.count(),
    prisma.profile.groupBy({ by: ["role"], _count: { id: true } }),
    prisma.course.count(),
    prisma.course.groupBy({ by: ["status"], _count: { id: true } }),
    prisma.enrollment.count(),
    prisma.lessonProgress.count({ where: { status: "completed" } }),
    prisma.profile.findMany({
      where: { createdAt: { gte: fourteenDaysAgo } },
      orderBy: { createdAt: "desc" },
      select: { id: true, fullName: true, email: true, role: true, createdAt: true },
    }),
    prisma.xPTransaction.findMany({
      where: { createdAt: { gte: fourteenDaysAgo } },
      select: { createdAt: true, userId: true },
    }),
    prisma.course.findMany({
      orderBy: { enrollments: { _count: "desc" } },
      take: 10,
      select: {
        id: true,
        title: true,
        status: true,
        teacher: { select: { fullName: true } },
        _count: { select: { enrollments: true } },
      },
    }),
    prisma.xPTransaction.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { userId: true },
      distinct: ["userId"],
    }),
    prisma.profile.count({
      where: { createdAt: { lt: thirtyDaysAgo } },
    }),
    prisma.xPTransaction.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { userId: true },
      distinct: ["userId"],
    }),
    prisma.lessonProgress.aggregate({
      where: { updatedAt: { gte: thirtyDaysAgo } },
      _sum: { timeSpent: true },
    }),
    prisma.xPTransaction.findMany({
      where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      select: { userId: true },
      distinct: ["userId"],
    }),
    // Retention cohorts: users who signed up in each of the last 4 weeks
    prisma.profile.findMany({
      where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), lt: new Date() } },
      select: { id: true, createdAt: true },
    }),
    prisma.profile.findMany({
      where: { createdAt: { gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      select: { id: true, createdAt: true },
    }),
    prisma.profile.findMany({
      where: { createdAt: { gte: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), lt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) } },
      select: { id: true, createdAt: true },
    }),
    prisma.profile.findMany({
      where: { createdAt: { gte: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000), lt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000) } },
      select: { id: true, createdAt: true },
    }),
    // Platform usage
    prisma.profile.count({
      where: {
        role: "teacher",
        courses: { some: { status: "published", deletedAt: null } },
      },
    }),
    prisma.profile.count({
      where: {
        role: "parent",
        children: { some: { lessonProgress: { some: { updatedAt: { gte: thirtyDaysAgo } } } } },
      },
    }),
    prisma.enrollment.groupBy({
      by: ["userId"],
      _count: { id: true },
    }),
    prisma.enrollment.findMany({
      select: { progress: true, completed: true },
    }),
    // Revenue analytics
    prisma.marketplacePurchase.aggregate({
      _sum: { price: true, platformFee: true, teacherCut: true },
    }),
    prisma.marketplacePurchase.aggregate({
      _sum: { platformFee: true },
    }),
    prisma.payoutTransaction.aggregate({
      where: { status: "completed" },
      _sum: { amount: true },
    }),
    prisma.course.findMany({
      where: { deletedAt: null, status: "published" },
      select: {
        id: true,
        title: true,
        enrollments: { select: { id: true, completed: true } },
        teacher: { select: { fullName: true } },
      },
      orderBy: { enrollments: { _count: "desc" } },
      take: 10,
    }),
  ]);

  // Calculate cohort retention
  const cohortData = [
    { cohort: "Week 1 (current)", total: week1Profiles.length, retained: 0, rate: 0 },
    { cohort: "Week 2", total: week2Profiles.length, retained: 0, rate: 0 },
    { cohort: "Week 3", total: week3Profiles.length, retained: 0, rate: 0 },
    { cohort: "Week 4", total: week4Profiles.length, retained: 0, rate: 0 },
  ];

  const allXpUserIds = new Set(recentXpTransactions.map((tx) => tx.userId));

  cohortData[0].retained = week1Profiles.filter((p) => allXpUserIds.has(p.id)).length;
  cohortData[1].retained = week2Profiles.filter((p) => allXpUserIds.has(p.id)).length;
  cohortData[2].retained = week3Profiles.filter((p) => allXpUserIds.has(p.id)).length;
  cohortData[3].retained = week4Profiles.filter((p) => allXpUserIds.has(p.id)).length;

  cohortData.forEach((c) => {
    c.rate = c.total > 0 ? Math.round((c.retained / c.total) * 100) : 0;
  });

  // Platform usage metrics
  const enrollmentDistribution = enrollmentsByRole.map((e) => e._count.id);
  const avgEnrollmentsPerUser = totalUsers > 0
    ? Math.round((enrollmentsByRole.length / totalUsers) * 100) / 100
    : 0;

  const completedCourses = courseCompletionRates.filter((e) => e.completed).length;
  const overallCompletionRate = courseCompletionRates.length > 0
    ? Math.round((completedCourses / courseCompletionRates.length) * 100)
    : 0;

  const avgProgress = courseCompletionRates.length > 0
    ? Math.round(courseCompletionRates.reduce((sum, e) => sum + e.progress, 0) / courseCompletionRates.length)
    : 0;

  // Monthly active by role
  const roleActivity = await Promise.all(
    ["student", "teacher", "parent"].map(async (role) => {
      const users = await prisma.xPTransaction.findMany({
        where: {
          createdAt: { gte: thirtyDaysAgo },
          user: { role },
        },
        select: { userId: true },
        distinct: ["userId"],
      });
      return { role, active: users.length };
    })
  );

  const roleDist = roleCounts.map((r) => ({ role: r.role, count: r._count.id }));
  const statusDist = statusCounts.map((s) => ({ status: s.status, count: s._count.id }));

  const dayMap: Record<string, { signups: number; activeUsers: Set<string> }> = {};
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    dayMap[key] = { signups: 0, activeUsers: new Set() };
  }

  for (const p of recentProfiles) {
    const key = new Date(p.createdAt).toISOString().slice(0, 10);
    if (dayMap[key]) dayMap[key].signups++;
  }

  for (const tx of recentXpTransactions) {
    const key = new Date(tx.createdAt).toISOString().slice(0, 10);
    if (dayMap[key]) dayMap[key].activeUsers.add(tx.userId);
  }

  const dailyStats = Object.entries(dayMap).map(([date, data]) => ({
    date,
    signups: data.signups,
    dau: data.activeUsers.size,
  }));

  const mau = mauUsers.length;
  const retentionRate = lastMonthUsers > 0
    ? Math.round((retainedUsers.length / lastMonthUsers) * 100)
    : 0;

  const totalTime = totalTimeSpent._sum.timeSpent ?? 0;
  const avgDailyLessons = Math.round((totalCompletedLessons / 30) * 10) / 10;

  const dau = new Set(recentXpTransactions.map((tx) => tx.userId)).size;
  const mauRatio = totalUsers > 0 ? Math.round((mau / totalUsers) * 100) : 0;

  const revenue = {
    totalRevenue: totalRevenue._sum.price ?? 0,
    platformFees: totalPlatformFees._sum.platformFee ?? 0,
    totalPayouts: totalPayouts._sum.amount ?? 0,
    netRevenue: (totalRevenue._sum.price ?? 0) - (totalPayouts._sum.amount ?? 0),
  };

  const coursePerf = coursePerformance.map((c) => ({
    id: c.id,
    title: c.title,
    teacher: c.teacher.fullName ?? "Unknown",
    enrollments: c.enrollments.length,
    completionRate: c.enrollments.length > 0
      ? Math.round((c.enrollments.filter((e) => e.completed).length / c.enrollments.length) * 100)
      : 0,
  }));

  return NextResponse.json({
    overview: {
      totalUsers,
      totalCourses,
      totalEnrollments,
      totalCompletedLessons,
    },
    engagement: {
      dau,
      mau,
      wau: weeklyActiveUsers.length,
      mauRatio,
      retentionRate,
      totalTimeSpent: totalTime,
      avgDailyLessons,
    },
    roleDistribution: roleDist,
    statusDistribution: statusDist,
    dailyStats,
    topCourses: topCourses.map((c) => ({
      id: c.id,
      title: c.title,
      status: c.status,
      teacher: c.teacher.fullName ?? "Unknown",
      enrollments: c._count.enrollments,
    })),
    retention: {
      overall: retentionRate,
      cohorts: cohortData,
    },
    platformUsage: {
      activeTeachers,
      activeParents,
      avgEnrollmentsPerUser,
      overallCompletionRate,
      avgProgress,
      roleActivity,
    },
    revenue,
    coursePerformance: coursePerf,
  });
}
