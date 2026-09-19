import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";

export async function GET() {
  const user = await getUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [
    totalUsers,
    totalCourses,
    totalEnrollments,
    totalLessons,
    totalMedia,
    totalPages,
    auditLogCount,
    recentErrors,
  ] = await Promise.all([
    prisma.profile.count(),
    prisma.course.count(),
    prisma.enrollment.count(),
    prisma.lesson.count(),
    prisma.media.count(),
    prisma.customPage.count(),
    prisma.auditLog.count(),
    prisma.auditLog.findMany({
      where: { action: "delete" },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const dbSize = await prisma.$queryRawUnsafe<{ size: number }[]>(
    "SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()"
  );

  return NextResponse.json({
    stats: {
      totalUsers,
      totalCourses,
      totalEnrollments,
      totalLessons,
      totalMedia,
      totalPages,
      auditLogCount,
      dbSizeBytes: dbSize[0]?.size ?? 0,
    },
    recentActivity: recentErrors.map((log) => ({
      id: log.id,
      action: log.action,
      resource: log.resource,
      userId: log.userId,
      createdAt: log.createdAt.toISOString(),
    })),
    health: {
      database: "connected",
      uptime: process.uptime(),
      nodeVersion: process.version,
      timestamp: new Date().toISOString(),
    },
  });
}
