import Link from "next/link";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Users, BookOpen, Trophy, ArrowRight, Bell, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ParentAlertSettings } from "@/components/parent/parent-alert-settings";

export default async function ParentDashboardPage() {
  const user = await getUser();
  const name = user?.email ? user.email.split("@")[0] : "there";

  let childrenData: {
    id: string;
    fullName: string | null;
    email: string | null;
    enrolledCourses: number;
    completedLessons: number;
    xp: number;
    streak: number;
  }[] = [];

  let alertConfig = {
    streakThreshold: 3,
    inactivityDays: 5,
    quizScoreThreshold: 60,
    notifyStreakDrop: true,
    notifyInactivity: true,
    notifyLowScores: true,
    notifyCourseComplete: true,
  };

  try {
    const parentProfile = await prisma.profile.findUnique({
      where: { id: user!.id },
      select: { metadata: true },
    });

    if (parentProfile?.metadata) {
      const metadata = JSON.parse(parentProfile.metadata) as Record<string, unknown>;
      const alertConfigData = metadata.alertConfig as Record<string, unknown> | undefined;
      if (alertConfigData) {
        alertConfig = {
          streakThreshold: (alertConfigData.streakThreshold as number) ?? 3,
          inactivityDays: (alertConfigData.inactivityDays as number) ?? 5,
          quizScoreThreshold: (alertConfigData.quizScoreThreshold as number) ?? 60,
          notifyStreakDrop: (alertConfigData.notifyStreakDrop as boolean) ?? true,
          notifyInactivity: (alertConfigData.notifyInactivity as boolean) ?? true,
          notifyLowScores: (alertConfigData.notifyLowScores as boolean) ?? true,
          notifyCourseComplete: (alertConfigData.notifyCourseComplete as boolean) ?? true,
        };
      }
    }

    const children = await prisma.profile.findMany({
      where: { parentId: user!.id },
      select: { id: true, fullName: true, email: true, xp: true, currentStreak: true },
    });

    const childIds = children.map((c) => c.id);

    const [enrollCounts, lessonCounts] = await Promise.all([
      prisma.enrollment.groupBy({
        by: ["userId"],
        where: { userId: { in: childIds } },
        _count: { id: true },
      }),
      prisma.lessonProgress.groupBy({
        by: ["userId"],
        where: { userId: { in: childIds }, status: "completed" },
        _count: { id: true },
      }),
    ]);

    const enrollMap = new Map(enrollCounts.map((e) => [e.userId, e._count.id]));
    const lessonMap = new Map(lessonCounts.map((l) => [l.userId, l._count.id]));

    childrenData = children.map((child) => ({
      id: child.id,
      fullName: child.fullName,
      email: child.email,
      enrolledCourses: enrollMap.get(child.id) ?? 0,
      completedLessons: lessonMap.get(child.id) ?? 0,
      xp: child.xp,
      streak: child.currentStreak,
    }));
  } catch {
    // Children data not available
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">Welcome, {name}</h1>
          <p className="mt-1 text-muted-foreground">Track your child&apos;s learning progress.</p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/parent/messages">
            <Mail className="h-4 w-4" />
            Messages
          </Link>
        </Button>
      </div>

      {childrenData.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center py-16 text-center">
          <Users className="h-10 w-10 text-muted-foreground/40" />
          <p className="mt-4 text-sm font-medium text-muted-foreground">No children linked to your account</p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            Children will appear once they link your account as their parent.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {childrenData.map((child) => (
            <div
              key={child.id}
              className="group relative overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-6 shadow-xl"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-heading text-lg font-bold text-foreground">
                    {child.fullName ?? child.email ?? "Child"}
                  </h2>
                  <p className="text-sm text-muted-foreground">{child.email}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="flex items-center gap-2 rounded-xl bg-[rgba(255,255,255,0.03)] p-3">
                  <BookOpen className="h-4 w-4 text-primary-400" />
                  <div>
                    <p className="text-xs text-muted-foreground">Courses</p>
                    <p className="font-heading text-lg font-bold text-foreground">{child.enrolledCourses}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-[rgba(255,255,255,0.03)] p-3">
                  <Trophy className="h-4 w-4 text-accent-400" />
                  <div>
                    <p className="text-xs text-muted-foreground">Lessons</p>
                    <p className="font-heading text-lg font-bold text-foreground">{child.completedLessons}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-[rgba(255,255,255,0.03)] p-3">
                  <Trophy className="h-4 w-4 text-yellow-400" />
                  <div>
                    <p className="text-xs text-muted-foreground">XP</p>
                    <p className="font-heading text-lg font-bold text-foreground">{child.xp}</p>
                  </div>
                </div>
              </div>

              {child.streak > 0 && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Current streak: {child.streak} day{child.streak !== 1 ? "s" : ""}
                </p>
              )}

              <div className="mt-4 flex justify-end">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/parent/children/${child.id}`}>
                    View Details
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </div>
            ))}
        </div>
      )}

      <ParentAlertSettings initialConfig={alertConfig} />
    </div>
  );
}
