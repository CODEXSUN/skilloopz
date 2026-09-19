import { prisma } from "@/lib/db";

export interface StreakNotification {
  type: "warning" | "milestone" | "recovery" | "freeze_available";
  title: string;
  message: string;
  action?: { label: string; href: string };
}

export async function getStreakNotifications(userId: string): Promise<StreakNotification[]> {
  const notifications: StreakNotification[] = [];

  const profile = await prisma.profile.findUnique({
    where: { id: userId },
    select: { currentStreak: true, longestStreak: true, lastActivityDate: true, xp: true, level: true },
  });

  if (!profile) return notifications;

  const now = new Date();
  const lastActivity = profile.lastActivityDate ? new Date(profile.lastActivityDate) : null;

  if (!lastActivity) {
    notifications.push({
      type: "warning",
      title: "Start your streak!",
      message: "Complete your first lesson today to begin your learning streak.",
      action: { label: "Browse courses", href: "/dashboard/courses" },
    });
    return notifications;
  }

  const hoursSinceLastActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);
  const daysSinceLastActivity = Math.floor(hoursSinceLastActivity / 24);

  if (daysSinceLastActivity === 0 && profile.currentStreak > 0) {
    notifications.push({
      type: "milestone",
      title: "🔥 Keep it going!",
      message: `You're on a ${profile.currentStreak}-day streak. Complete a lesson today to maintain it!`,
      action: { label: "Continue learning", href: "/dashboard" },
    });
  }

  if (daysSinceLastActivity === 1 && profile.currentStreak > 0) {
    notifications.push({
      type: "warning",
      title: "⚠️ Streak at risk!",
      message: `You haven't learned today. Your ${profile.currentStreak}-day streak will reset if you don't complete a lesson before midnight.`,
      action: { label: "Save your streak", href: "/dashboard" },
    });
  }

  if (daysSinceLastActivity >= 2 && profile.currentStreak === 0 && profile.longestStreak >= 7) {
    notifications.push({
      type: "recovery",
      title: "💪 Come back stronger!",
      message: `Your streak was lost, but your longest was ${profile.longestStreak} days. Start a new streak today!`,
      action: { label: "Start fresh", href: "/dashboard/courses" },
    });
  }

  if (profile.currentStreak > 0 && profile.currentStreak % 7 === 0 && daysSinceLastActivity === 0) {
    const weekCount = profile.currentStreak / 7;
    notifications.push({
      type: "milestone",
      title: `🏆 ${weekCount} week${weekCount > 1 ? "s" : ""} strong!`,
      message: `You've maintained a ${profile.currentStreak}-day streak. That's ${weekCount} week${weekCount > 1 ? "s" : ""} of consistent learning!`,
    });
  }

  if (profile.currentStreak >= 3 && profile.currentStreak < 7 && daysSinceLastActivity === 0) {
    const daysToNext = 7 - profile.currentStreak;
    notifications.push({
      type: "milestone",
      title: "🎯 Almost a Week Warrior!",
      message: `${daysToNext} more day${daysToNext > 1 ? "s" : ""} to reach a 7-day streak and earn the Week Warrior badge!`,
      action: { label: "Keep going", href: "/dashboard" },
    });
  }

  return notifications;
}

export async function getStreakHistory(userId: string, days = 30): Promise<{ date: string; active: boolean }[]> {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const activities = await prisma.lessonProgress.findMany({
    where: {
      userId,
      updatedAt: { gte: startDate },
    },
    select: { updatedAt: true },
    orderBy: { updatedAt: "asc" },
  });

  const activeDays = new Set<string>();
  for (const activity of activities) {
    const date = activity.updatedAt.toISOString().split("T")[0];
    activeDays.add(date);
  }

  const history: { date: string; active: boolean }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split("T")[0];
    history.push({ date: dateStr, active: activeDays.has(dateStr) });
  }

  return history;
}
