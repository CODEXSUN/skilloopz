import { Users, BookOpen, GraduationCap, FileText, Activity, ArrowRight } from "lucide-react";
import Link from "next/link";

import { prisma } from "@/lib/db";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";

interface AuditEntry {
  id: string;
  action: string;
  resource: string;
  resourceId: string | null;
  details: string;
  createdAt: Date;
}

const ACTION_LABELS: Record<string, string> = {
  create: "Created",
  update: "Updated",
  delete: "Deleted",
  publish: "Published",
  permission_change: "Changed permissions",
  theme_change: "Changed theme",
};

export default async function AdminDashboardPage() {
  const [totalUsers, roleCounts, totalCourses, totalEnrollments, pageCounts, sectionCount, recentAuditLogs] =
    await Promise.all([
      prisma.profile.count(),
      prisma.profile.groupBy({
        by: ["role"],
        _count: { id: true },
      }),
      prisma.course.count(),
      prisma.enrollment.count(),
      prisma.customPage.groupBy({
        by: ["status"],
        _count: { id: true },
      }),
      prisma.pageSection.count(),
      prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  const roleMap: Record<string, number> = {};
  for (const r of roleCounts) {
    roleMap[r.role] = r._count.id;
  }

  const pageMap: Record<string, number> = {};
  for (const p of pageCounts) {
    pageMap[p.status] = p._count.id;
  }

  const stats = [
    {
      icon: Users,
      label: "Total Users",
      value: totalUsers,
      sub: `${roleMap["student"] ?? 0} students · ${roleMap["teacher"] ?? 0} teachers · ${roleMap["parent"] ?? 0} parents`,
    },
    {
      icon: BookOpen,
      label: "Courses",
      value: totalCourses,
      sub: `${totalEnrollments} total enrollments`,
    },
    {
      icon: GraduationCap,
      label: "Enrollments",
      value: totalEnrollments,
    },
    {
      icon: FileText,
      label: "Custom Pages",
      value: (pageMap["published"] ?? 0) + (pageMap["draft"] ?? 0),
      sub: `${pageMap["published"] ?? 0} published · ${pageMap["draft"] ?? 0} drafts · ${sectionCount} sections`,
    },
  ];

  function parseDetails(details: string): string {
    try {
      const d = JSON.parse(details);
      return d.title || d.name || d.slug || "";
    } catch {
      return "";
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Platform overview and management.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <div className="flex items-center gap-4 p-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary-100">
                  <Icon className="h-6 w-6 text-primary-600" />
                </div>
                <div className="min-w-0">
                  <CardDescription>{stat.label}</CardDescription>
                  <CardTitle className="mt-0 text-2xl">{stat.value}</CardTitle>
                  {stat.sub && (
                    <p className="mt-0.5 truncate text-xs text-tertiary-foreground">
                      {stat.sub}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      {recentAuditLogs.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Recent Activity</h2>
            <Link
              href="/admin/audit-logs"
              className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {recentAuditLogs.map((log: AuditEntry) => (
              <div
                key={log.id}
                className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/5 px-4 py-2.5"
              >
                <Activity className="h-3.5 w-3.5 text-muted-foreground/40" />
                <span className="text-xs text-foreground">
                  <span className="font-medium">{ACTION_LABELS[log.action] ?? log.action}</span>
                  {" "}{log.resource}
                  {parseDetails(log.details) && (
                    <span className="text-muted-foreground"> — {parseDetails(log.details)}</span>
                  )}
                </span>
                <span className="ml-auto text-[10px] text-muted-foreground/60">
                  {formatRelativeTime(log.createdAt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function formatRelativeTime(date: Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
