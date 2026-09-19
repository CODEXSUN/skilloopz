import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { ChildDetailClient } from "@/components/parent/child-detail-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ChildDetailPage({ params }: PageProps) {
  const { id } = await params;

  const user = await getUser();
  if (!user) redirect("/login");
  if (user.role !== "parent") redirect("/dashboard");

  const child = await prisma.profile.findFirst({
    where: { id, parentId: user.id },
    select: {
      id: true,
      fullName: true,
      email: true,
      xp: true,
      level: true,
      currentStreak: true,
      longestStreak: true,
      avatarUrl: true,
      lastActivityDate: true,
    },
  });

  if (!child) redirect("/parent");

  const [enrollments, completedLessonsCount, userAchievements] = await Promise.all([
    prisma.enrollment.findMany({
      where: { userId: id, course: { deletedAt: null } },
      include: {
        course: { select: { id: true, title: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.lessonProgress.count({
      where: { userId: id, status: "completed" },
    }),
    prisma.userAchievement.findMany({
      where: { userId: id },
      include: {
        achievement: {
          select: { id: true, name: true, description: true, iconUrl: true, xpReward: true },
        },
      },
      orderBy: { earnedAt: "desc" },
    }),
  ]);

  return (
    <ChildDetailClient
      child={{
        id: child.id,
        fullName: child.fullName,
        email: child.email,
        xp: child.xp,
        level: child.level,
        currentStreak: child.currentStreak,
        longestStreak: child.longestStreak,
        avatarUrl: child.avatarUrl,
        lastActivityDate: child.lastActivityDate?.toISOString() ?? null,
      }}
      enrollments={enrollments.map((e) => ({
        id: e.id,
        courseId: e.course.id,
        courseTitle: e.course.title,
        progress: e.progress,
        completed: e.completed,
      }))}
      completedLessonsCount={completedLessonsCount}
      achievements={userAchievements.map((ua) => ({
        id: ua.achievement.id,
        name: ua.achievement.name,
        description: ua.achievement.description,
        iconUrl: ua.achievement.iconUrl,
        xpReward: ua.achievement.xpReward,
        earnedAt: ua.earnedAt.toISOString(),
      }))}
    />
  );
}
