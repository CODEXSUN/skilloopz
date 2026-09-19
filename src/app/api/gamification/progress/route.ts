import { NextResponse } from "next/server";

import { getUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { BADGES } from "@/lib/gamification/badges";
import { ACHIEVEMENTS } from "@/lib/gamification/achievements";

export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.profile.findUnique({
    where: { id: userId },
    select: { xp: true, level: true, currentStreak: true, fullName: true },
  });

  const [enrollments, bookmarks, notes, certificates, xpTotal, perfectQuizzes, lessonsToday] = await Promise.all([
    prisma.enrollment.count({ where: { userId } }),
    prisma.bookmark.count({ where: { userId } }),
    prisma.lessonNote.count({ where: { userId } }),
    prisma.certificate.count({ where: { userId } }),
    prisma.xPTransaction.aggregate({ where: { userId }, _sum: { amount: true } }),
    prisma.lessonProgress.count({ where: { userId, score: 100 } }),
    prisma.lessonProgress.count({
      where: {
        userId,
        status: "completed",
        updatedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    }),
  ]);

  const earnedAchievements = await prisma.userAchievement.findMany({
    where: { userId },
    select: { achievementId: true },
  });

  const earnedBadges = await prisma.userBadge.findMany({
    where: { userId },
    select: { badgeId: true },
  });

  const earnedAchievementIds = new Set(earnedAchievements.map((a) => a.achievementId));
  const earnedBadgeIds = new Set(earnedBadges.map((b) => b.badgeId));

  function getBadgeProgress(badgeId: string): { current: number; target: number; percentage: number } {
    const badge = BADGES.find((b) => b.id === badgeId);
    if (!badge) return { current: 0, target: 1, percentage: 0 };

    const criteria = JSON.parse(badge.criteria);
    let current = 0;
    let target = 1;

    switch (criteria.type) {
      case "first_login":
      case "profile_complete":
      case "first_enrollment":
      case "first_bookmark":
      case "first_note":
        current = 0;
        target = 1;
        break;
      case "enrollments":
        current = enrollments;
        target = criteria.value;
        break;
      case "bookmarks":
        current = bookmarks;
        target = criteria.value;
        break;
      case "notes":
        current = notes;
        target = criteria.value;
        break;
      case "perfect_quizzes":
        current = perfectQuizzes;
        target = criteria.value;
        break;
      case "lessons_per_day":
        current = lessonsToday;
        target = criteria.value;
        break;
      case "streak":
        current = profile?.currentStreak ?? 0;
        target = criteria.value;
        break;
      case "certificates":
        current = certificates;
        target = criteria.value;
        break;
      case "total_xp":
        current = xpTotal._sum.amount ?? 0;
        target = criteria.value;
        break;
      case "level":
        current = profile?.level ?? 1;
        target = criteria.value;
        break;
      default:
        current = 0;
        target = 1;
    }

    return { current, target, percentage: Math.min(100, Math.round((current / target) * 100)) };
  }

  const badgeProgress = BADGES.map((badge) => ({
    ...badge,
    earned: earnedBadgeIds.has(badge.id),
    progress: getBadgeProgress(badge.id),
  }));

  const achievementProgress = ACHIEVEMENTS.map((achievement) => ({
    ...achievement,
    earned: earnedAchievementIds.has(achievement.id),
  }));

  const rarityCounts = {
    common: badgeProgress.filter((b) => b.earned && b.rarity === "common").length,
    uncommon: badgeProgress.filter((b) => b.earned && b.rarity === "uncommon").length,
    rare: badgeProgress.filter((b) => b.earned && b.rarity === "rare").length,
    epic: badgeProgress.filter((b) => b.earned && b.rarity === "epic").length,
    legendary: badgeProgress.filter((b) => b.earned && b.rarity === "legendary").length,
  };

  return NextResponse.json({
    badges: badgeProgress,
    achievements: achievementProgress,
    totalXp: profile?.xp ?? 0,
    rarityCounts,
  });
}
