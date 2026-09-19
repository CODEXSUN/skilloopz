import { prisma } from "@/lib/db";
import { NOTIFICATION_TYPES } from "@/lib/notifications";

export interface AlertConfig {
  streakThreshold: number;
  inactivityDays: number;
  quizScoreThreshold: number;
  notifyStreakDrop: boolean;
  notifyInactivity: boolean;
  notifyLowScores: boolean;
  notifyCourseComplete: boolean;
}

export const DEFAULT_ALERT_CONFIG: AlertConfig = {
  streakThreshold: 3,
  inactivityDays: 5,
  quizScoreThreshold: 60,
  notifyStreakDrop: true,
  notifyInactivity: true,
  notifyLowScores: true,
  notifyCourseComplete: true,
};

export function getParentAlertConfig(metadata: Record<string, unknown>): AlertConfig {
  const config = metadata.alertConfig as Record<string, unknown> | undefined;
  if (!config) return DEFAULT_ALERT_CONFIG;
  return {
    streakThreshold: (config.streakThreshold as number) ?? DEFAULT_ALERT_CONFIG.streakThreshold,
    inactivityDays: (config.inactivityDays as number) ?? DEFAULT_ALERT_CONFIG.inactivityDays,
    quizScoreThreshold: (config.quizScoreThreshold as number) ?? DEFAULT_ALERT_CONFIG.quizScoreThreshold,
    notifyStreakDrop: (config.notifyStreakDrop as boolean) ?? DEFAULT_ALERT_CONFIG.notifyStreakDrop,
    notifyInactivity: (config.notifyInactivity as boolean) ?? DEFAULT_ALERT_CONFIG.notifyInactivity,
    notifyLowScores: (config.notifyLowScores as boolean) ?? DEFAULT_ALERT_CONFIG.notifyLowScores,
    notifyCourseComplete: (config.notifyCourseComplete as boolean) ?? DEFAULT_ALERT_CONFIG.notifyCourseComplete,
  };
}

export async function checkAndSendParentAlerts(childId: string): Promise<void> {
  const child = await prisma.profile.findUnique({
    where: { id: childId },
    select: {
      id: true,
      fullName: true,
      parentId: true,
      currentStreak: true,
      lastActivityDate: true,
    },
  });

  if (!child?.parentId) return;

  const parent = await prisma.profile.findUnique({
    where: { id: child.parentId },
    select: { id: true, metadata: true },
  });

  if (!parent) return;

  const metadata = JSON.parse(parent.metadata ?? "{}") as Record<string, unknown>;
  const config = getParentAlertConfig(metadata);

  const childName = child.fullName ?? "Your child";

  if (config.notifyStreakDrop && child.currentStreak < config.streakThreshold && child.currentStreak > 0) {
    await prisma.notification.create({
      data: {
        userId: parent.id,
        type: "streak_reminder",
        title: `${childName}'s streak is dropping`,
        message: `${childName}'s learning streak is at ${child.currentStreak} day${child.currentStreak !== 1 ? "s" : ""}. Encourage them to complete a lesson today!`,
        link: `/parent/children/${child.id}`,
      },
    });
  }

  if (config.notifyInactivity && child.lastActivityDate) {
    const daysSinceActivity = Math.floor((Date.now() - new Date(child.lastActivityDate).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceActivity >= config.inactivityDays) {
      await prisma.notification.create({
        data: {
          userId: parent.id,
          type: "info",
          title: `${childName} hasn't been active`,
          message: `${childName} hasn't completed any lessons in ${daysSinceActivity} days.`,
          link: `/parent/children/${child.id}`,
        },
      });
    }
  }

  const recentQuizScores = await prisma.lessonProgress.findMany({
    where: {
      userId: childId,
      score: { not: null },
      updatedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    },
    select: { score: true, lesson: { select: { title: true } } },
    orderBy: { updatedAt: "desc" },
    take: 5,
  });

  if (config.notifyLowScores && recentQuizScores.length > 0) {
    const lowScores = recentQuizScores.filter((q) => (q.score ?? 100) < config.quizScoreThreshold);
    if (lowScores.length > 0) {
      const avgLowScore = Math.round(lowScores.reduce((sum, q) => sum + (q.score ?? 0), 0) / lowScores.length);
      await prisma.notification.create({
        data: {
          userId: parent.id,
          type: "grading_alert",
          title: `${childName} needs help with quizzes`,
          message: `${childName} scored below ${config.quizScoreThreshold}% on ${lowScores.length} recent quiz${lowScores.length > 1 ? "zes" : ""} (avg: ${avgLowScore}%).`,
          link: `/parent/children/${child.id}`,
        },
      });
    }
  }
}
