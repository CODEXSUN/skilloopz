import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import { cpus, freemem, totalmem, uptime, platform, arch, version } from "os";
import { statSync, readFileSync } from "fs";

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const permError = await requirePermission(user.role, "settings", "read");
  if (permError) return permError;

  const startTime = Date.now();

  const [
    dbHealth,
    dbSize,
    dbTableCounts,
    recentErrors,
    activeSessions,
    auditLogRate,
  ] = await Promise.allSettled([
    testDatabaseConnection(),
    getDatabaseSize(),
    getTableCounts(),
    getRecentErrors(),
    getActiveSessions(),
    getAuditLogRate(),
  ]);

  const responseTime = Date.now() - startTime;

  const systemHealth = {
    uptime: formatUptime(uptime()),
    platform: platform(),
    arch: arch(),
    nodeVersion: version,
    cpuCount: cpus().length,
    cpuModel: cpus()[0]?.model ?? "Unknown",
    memory: {
      total: totalmem(),
      free: freemem(),
      used: totalmem() - freemem(),
      usagePercent: Math.round(((totalmem() - freemem()) / totalmem()) * 100),
    },
    disk: await getDiskUsage(),
  };

  const dbStatus = dbHealth.status === "fulfilled" && dbHealth.value ? "healthy" : "unhealthy";
  const dbSizeValue = dbSize.status === "fulfilled" ? dbSize.value : "N/A";
  const dbTableCountsValue = dbTableCounts.status === "fulfilled" ? dbTableCounts.value : {};
  const recentErrorsValue = recentErrors.status === "fulfilled" ? recentErrors.value : [];
  const activeSessionsValue = activeSessions.status === "fulfilled" ? activeSessions.value : 0;
  const auditLogRateValue = auditLogRate.status === "fulfilled" ? auditLogRate.value : 0;

  const checks = [
    { name: "Database Connection", status: dbStatus, detail: dbStatus === "healthy" ? "Connected" : "Failed" },
    { name: "Database Size", status: "ok", detail: dbSizeValue },
    { name: "API Response Time", status: responseTime < 500 ? "ok" : "warning", detail: `${responseTime}ms` },
    { name: "Memory Usage", status: systemHealth.memory.usagePercent < 80 ? "ok" : "warning", detail: `${systemHealth.memory.usagePercent}% used` },
    { name: "Active Sessions", status: "ok", detail: `${activeSessionsValue} sessions` },
    { name: "Recent Errors", status: recentErrorsValue.length === 0 ? "ok" : "warning", detail: `${recentErrorsValue.length} errors in last 24h` },
    { name: "Audit Log Rate", status: "ok", detail: `${auditLogRateValue} entries/hour` },
  ];

  const overallStatus = checks.every((c) => c.status === "ok" || c.status === "healthy")
    ? "healthy"
    : checks.some((c) => c.status === "unhealthy")
      ? "critical"
      : "degraded";

  return NextResponse.json({
    overall: overallStatus,
    responseTime,
    system: systemHealth,
    database: {
      status: dbStatus,
      size: dbSizeValue,
      tables: dbTableCountsValue,
    },
    checks,
    recentErrors: recentErrorsValue.map((e) => ({
      ...e,
      createdAt: e.createdAt.toISOString(),
    })),
  });
}

async function testDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
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

async function getTableCounts(): Promise<Record<string, number>> {
  const tables = ["Profile", "Course", "Enrollment", "LessonProgress", "AuditLog", "School", "Session"];
  const counts: Record<string, number> = {};

  for (const table of tables) {
    try {
      const count = await (prisma as any)[table.toLowerCase()]?.count();
      counts[table] = count ?? 0;
    } catch {
      counts[table] = 0;
    }
  }

  return counts;
}

async function getRecentErrors(): Promise<Array<{ id: string; action: string; resource: string; details: string; createdAt: Date }>> {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const errors = await prisma.auditLog.findMany({
      where: {
        action: { in: ["error", "failed", "exception"] },
        createdAt: { gte: oneDayAgo },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    return errors;
  } catch {
    return [];
  }
}

async function getActiveSessions(): Promise<number> {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return await prisma.session.count({
      where: { createdAt: { gte: oneHourAgo } },
    });
  } catch {
    return 0;
  }
}

async function getAuditLogRate(): Promise<number> {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return await prisma.auditLog.count({
      where: { createdAt: { gte: oneHourAgo } },
    });
  } catch {
    return 0;
  }
}

async function getDiskUsage(): Promise<{ total: string; used: string; free: string; usagePercent: number }> {
  try {
    const dbPath = "prisma/dev.db";
    const stats = statSync(dbPath);
    const total = 1024 * 1024 * 1024;
    const used = stats.size;
    const free = total - used;
    return {
      total: formatBytes(total),
      used: formatBytes(used),
      free: formatBytes(free),
      usagePercent: Math.round((used / total) * 100),
    };
  } catch {
    return { total: "N/A", used: "N/A", free: "N/A", usagePercent: 0 };
  }
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${days}d ${hours}h ${minutes}m`;
}

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}
