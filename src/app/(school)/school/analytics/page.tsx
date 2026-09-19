import { Users, BookOpen, TrendingUp, Award, Clock } from "lucide-react";

import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function SchoolAnalyticsPage() {
  const user = await getUser();
  if (!user || !user.schoolId) return null;

  const school = await prisma.school.findUnique({
    where: { id: user.schoolId },
  });

  if (!school) return null;

  const [
    totalTeachers,
    totalStudents,
    totalCourses,
    totalEnrollments,
    completedEnrollments,
    avgProgress,
    topCourses,
    recentEnrollments,
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
      where: { course: { schoolId: school.id, deletedAt: null } },
    }),
    prisma.enrollment.count({
      where: { course: { schoolId: school.id, deletedAt: null }, completed: true },
    }),
    prisma.enrollment.aggregate({
      where: { course: { schoolId: school.id, deletedAt: null } },
      _avg: { progress: true },
    }),
    prisma.course.findMany({
      where: { schoolId: school.id, deletedAt: null },
      include: {
        _count: {
          select: { enrollments: true },
        },
      },
      orderBy: {
        enrollments: { _count: "desc" },
      },
      take: 5,
    }),
    prisma.enrollment.findMany({
      where: { course: { schoolId: school.id, deletedAt: null } },
      include: {
        user: { select: { fullName: true, email: true } },
        course: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const completionRate = totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0;
  const avgProg = avgProgress._avg.progress ?? 0;

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
          School Analytics
        </h1>
        <p className="mt-1 text-muted-foreground">
          Performance metrics and insights for {school.name}.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
              <Users className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <CardDescription>Students</CardDescription>
              <CardTitle className="mt-0 text-2xl">{totalStudents}</CardTitle>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-green-500/10">
              <Users className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <CardDescription>Teachers</CardDescription>
              <CardTitle className="mt-0 text-2xl">{totalTeachers}</CardTitle>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-purple-500/10">
              <BookOpen className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <CardDescription>Courses</CardDescription>
              <CardTitle className="mt-0 text-2xl">{totalCourses}</CardTitle>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-yellow-500/10">
              <TrendingUp className="h-6 w-6 text-yellow-400" />
            </div>
            <div>
              <CardDescription>Completion Rate</CardDescription>
              <CardTitle className="mt-0 text-2xl">{completionRate.toFixed(0)}%</CardTitle>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Courses by Enrollment</CardTitle>
            <CardDescription>Most popular courses in your school.</CardDescription>
          </CardHeader>
          <CardContent>
            {topCourses.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-4">No courses yet.</p>
            ) : (
              <div className="space-y-3">
                {topCourses.map((course, index) => (
                  <div key={course.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="w-6 justify-center">
                        {index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium text-foreground">{course.title}</p>
                        <p className="text-xs text-muted-foreground">{course.subject ?? "General"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {course._count.enrollments}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Enrollments</CardTitle>
            <CardDescription>Latest student enrollments.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentEnrollments.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-4">No enrollments yet.</p>
            ) : (
              <div className="space-y-3">
                {recentEnrollments.map((enrollment) => (
                  <div key={enrollment.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">
                        {enrollment.user.fullName ?? enrollment.user.email}
                      </p>
                      <p className="text-xs text-muted-foreground">{enrollment.course.title}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatRelativeTime(enrollment.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Progress Overview</CardTitle>
          <CardDescription>Average progress across all enrollments.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Average Progress</span>
              <span className="font-medium text-foreground">{avgProg.toFixed(1)}%</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${Math.min(avgProg, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </CardContent>
      </Card>
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
