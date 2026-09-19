import Link from "next/link";
import { Users, BookOpen, TrendingUp, Award, ArrowRight, Activity } from "lucide-react";

import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function SchoolDashboardPage() {
  const user = await getUser();
  if (!user || !user.schoolId) return null;

  const school = await prisma.school.findUnique({
    where: { id: user.schoolId },
    include: {
      whiteLabel: true,
    },
  });

  if (!school) return null;

  const [
    totalTeachers,
    totalStudents,
    totalCourses,
    totalEnrollments,
    recentActivity,
  ] = await Promise.all([
    prisma.profile.count({
      where: { schoolId: school.id, role: "teacher" },
    }),
    prisma.profile.count({
      where: { schoolId: school.id, role: "student" },
    }),
    prisma.course.count({
      where: { schoolId: school.id, deletedAt: null },
    }),
    prisma.enrollment.count({
      where: {
        course: {
          schoolId: school.id,
          deletedAt: null,
        },
      },
    }),
    prisma.auditLog.findMany({
      where: {
        resource: "Course",
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const stats = [
    {
      icon: Users,
      label: "Teachers",
      value: totalTeachers,
      href: "/school/staff",
    },
    {
      icon: Users,
      label: "Students",
      value: totalStudents,
      href: "/school/students",
    },
    {
      icon: BookOpen,
      label: "Courses",
      value: totalCourses,
      href: "/school/courses",
    },
    {
      icon: TrendingUp,
      label: "Enrollments",
      value: totalEnrollments,
      href: "/school/analytics",
    },
  ];

  const tierLabels: Record<string, string> = {
    free: "Free",
    pro: "Pro",
    school: "School",
    enterprise: "Enterprise",
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
            {school.name}
          </h1>
          <p className="mt-1 text-muted-foreground">
            School management dashboard &middot; {tierLabels[school.tier] ?? school.tier} plan
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/school/settings">Settings</Link>
          </Button>
          <Button asChild>
            <Link href="/school/analytics">
              <TrendingUp className="h-4 w-4" />
              Analytics
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <Link href={stat.href} className="block">
                <div className="flex items-center gap-4 p-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary-100">
                    <Icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="min-w-0">
                    <CardDescription>{stat.label}</CardDescription>
                    <CardTitle className="mt-0 text-2xl">{stat.value}</CardTitle>
                  </div>
                </div>
              </Link>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Quick Actions</h2>
          </div>
          <div className="space-y-2">
            <Button asChild variant="outline" className="w-full justify-start gap-2">
              <Link href="/school/staff">
                <Users className="h-4 w-4" />
                Manage Staff
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start gap-2">
              <Link href="/school/students">
                <Users className="h-4 w-4" />
                Manage Students
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start gap-2">
              <Link href="/school/courses">
                <BookOpen className="h-4 w-4" />
                View Courses
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start gap-2">
              <Link href="/school/settings">
                <Award className="h-4 w-4" />
                White-Label Settings
              </Link>
            </Button>
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Recent Activity</h2>
            <Link
              href="/school/activity"
              className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {recentActivity.length === 0 ? (
            <div className="glass-card flex flex-col items-center justify-center py-8 text-center">
              <Activity className="h-8 w-8 text-muted-foreground/40" />
              <p className="mt-2 text-sm text-muted-foreground">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentActivity.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/5 px-4 py-2.5"
                >
                  <Activity className="h-3.5 w-3.5 text-muted-foreground/40" />
                  <span className="text-xs text-foreground">
                    <span className="font-medium">{log.action}</span> {log.resource}
                  </span>
                  <span className="ml-auto text-[10px] text-muted-foreground/60">
                    {formatRelativeTime(log.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {school.whiteLabel && (
        <div className="glass-card rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-6">
          <h2 className="font-heading text-lg font-bold text-foreground">Branding Preview</h2>
          <div className="mt-4 flex items-center gap-4">
            {school.whiteLabel.logoUrl && (
              <img
                src={school.whiteLabel.logoUrl}
                alt="School logo"
                className="h-12 w-auto rounded-lg"
              />
            )}
            <div className="flex gap-2">
              <div
                className="h-8 w-8 rounded-full border border-white/10"
                style={{ backgroundColor: school.whiteLabel.primaryColor }}
                title="Primary color"
              />
              <div
                className="h-8 w-8 rounded-full border border-white/10"
                style={{ backgroundColor: school.whiteLabel.secondaryColor }}
                title="Secondary color"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {school.whiteLabel.hideBranding ? "NEOT branding hidden" : "NEOT branding visible"}
            </p>
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
