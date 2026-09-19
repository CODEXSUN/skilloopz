import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const permError = await requirePermission(user.role, "settings", "read");
  if (permError) return permError;

  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    activeUsersToday,
    totalCourses,
    totalEnrollments,
    totalLessons,
    totalAuditLogs,
    recentAuditLogs,
    auditLogsByAction,
    auditLogsByResource,
    usersByRole,
    coursesByStatus,
    enrollmentsByDay,
    dbSize,
  ] = await Promise.all([
    prisma.profile.count(),
    prisma.profile.count({ where: { lastActivityDate: { gte: oneDayAgo } } }),
    prisma.course.count(),
    prisma.enrollment.count(),
    prisma.lessonProgress.count(),
    prisma.auditLog.count(),
    prisma.auditLog.findMany({
      where: { createdAt: { gte: oneHourAgo } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.auditLog.groupBy({
      by: ["action"],
      _count: true,
      orderBy: { _count: { action: "desc" } },
      take: 10,
    }),
    prisma.auditLog.groupBy({
      by: ["resource"],
      _count: true,
      orderBy: { _count: { resource: "desc" } },
      take: 10,
    }),
    prisma.profile.groupBy({
      by: ["role"],
      _count: true,
    }),
    prisma.course.groupBy({
      by: ["status"],
      _count: true,
    }),
    prisma.enrollment.groupBy({
      by: ["createdAt"],
      _count: true,
      where: { createdAt: { gte: oneWeekAgo } },
    }),
    getDatabaseSize(),
  ]);

  const avgEnrollmentsPerDay = enrollmentsByDay.length > 0
    ? enrollmentsByDay.reduce((sum, e) => sum + e._count, 0) / Math.max(enrollmentsByDay.length, 1)
    : 0;

  return NextResponse.json({
    overview: {
      totalUsers,
      activeUsersToday,
      totalCourses,
      totalEnrollments,
      totalLessons,
      totalAuditLogs,
      dbSize,
    },
    activity: {
      recentAuditLogs: recentAuditLogs.map((log) => ({
        ...log,
        createdAt: log.createdAt.toISOString(),
      })),
      auditLogsByAction: auditLogsByAction.map((g) => ({
        action: g.action,
        count: g._count,
      })),
      auditLogsByResource: auditLogsByResource.map((g) => ({
        resource: g.resource,
        count: g._count,
      })),
    },
    distribution: {
      usersByRole: usersByRole.map((g) => ({
        role: g.role,
        count: g._count,
      })),
      coursesByStatus: coursesByStatus.map((g) => ({
        status: g.status,
        count: g._count,
      })),
    },
    trends: {
      avgEnrollmentsPerDay: Math.round(avgEnrollmentsPerDay * 100) / 100,
      enrollmentsLastWeek: enrollmentsByDay.reduce((sum, e) => sum + e._count, 0),
    },
  });
}

async function getDatabaseSize(): Promise<string> {
  try {
    const result = await prisma.$queryRaw<{ size: number }[]>`
      SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()
    `;
    const bytes = result[0]?.size ?? 0;
    if (bytes > 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    if (bytes > 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${bytes} B`;
  } catch {
    return "N/A";
  }
}
