import { prisma } from "@/lib/db";
import { BADGES } from "./badges";

export interface NewBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
}

export async function ensureBadgesSeeded(): Promise<void> {
  await prisma.$transaction(async (tx) => {
    for (const b of BADGES) {
      await tx.badge.upsert({
        where: { id: b.id },
        update: { name: b.name, description: b.description, iconUrl: b.icon, category: b.category, xpReward: b.xpReward, criteria: b.criteria },
        create: {
          id: b.id,
          name: b.name,
          description: b.description,
          iconUrl: b.icon,
          category: b.category,
          xpReward: b.xpReward,
          criteria: b.criteria,
        },
      });
    }
  });
}

export async function checkAndAwardBadges(
  userId: string,
  tx: any,
): Promise<NewBadge[]> {
  for (const b of BADGES) {
    await tx.badge.upsert({
      where: { id: b.id },
      update: { name: b.name, description: b.description, iconUrl: b.icon, category: b.category, xpReward: b.xpReward, criteria: b.criteria },
      create: {
        id: b.id,
        name: b.name,
        description: b.description,
        iconUrl: b.icon,
        category: b.category,
        xpReward: b.xpReward,
        criteria: b.criteria,
      },
    });
  }

  const profile = await tx.profile.findUnique({ where: { id: userId } });
  if (!profile) return [];

  const [
    enrollments,
    bookmarks,
    notes,
    perfectQuizzes,
    certificates,
    lessonsToday,
  ] = await Promise.all([
    tx.enrollment.count({ where: { userId } }),
    tx.bookmark.count({ where: { userId } }),
    tx.lessonNote.count({ where: { userId } }),
    tx.lessonProgress.count({ where: { userId, score: 100 } }),
    tx.certificate.count({ where: { userId } }),
    tx.lessonProgress.count({
      where: {
        userId,
        status: "completed",
        updatedAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
  ]);

  const earned = await tx.userBadge.findMany({
    where: { userId },
    select: { badgeId: true },
  });
  const earnedIds = new Set(earned.map((e: { badgeId: string }) => e.badgeId));

  const checks: { id: string; condition: boolean }[] = [
    { id: "first_login", condition: true },
    { id: "profile_complete", condition: !!(profile.fullName && profile.ageGroup) },
    { id: "first_enrollment", condition: enrollments >= 1 },
    { id: "three_courses", condition: enrollments >= 3 },
    { id: "first_bookmark", condition: bookmarks >= 1 },
    { id: "ten_bookmarks", condition: bookmarks >= 10 },
    { id: "first_note", condition: notes >= 1 },
    { id: "five_notes", condition: notes >= 5 },
    { id: "quiz_master", condition: perfectQuizzes >= 5 },
    { id: "speed_learner", condition: lessonsToday >= 3 },
    { id: "week_warrior_badge", condition: (profile.longestStreak ?? 0) >= 7 },
    { id: "monthly_master_badge", condition: (profile.longestStreak ?? 0) >= 30 },
    { id: "first_certificate", condition: certificates >= 1 },
    { id: "five_certificates", condition: certificates >= 5 },
    { id: "xp_1000", condition: profile.xp >= 1000 },
    { id: "xp_5000", condition: profile.xp >= 5000 },
    { id: "level_10", condition: profile.level >= 10 },
    { id: "level_25", condition: profile.level >= 25 },
    { id: "level_50", condition: profile.level >= 50 },
  ];

  const newlyAwarded: NewBadge[] = [];

  for (const check of checks) {
    if (check.condition && !earnedIds.has(check.id)) {
      const badge = await tx.badge.findUnique({ where: { id: check.id } });
      if (badge) {
        await tx.userBadge.create({
          data: { userId, badgeId: check.id },
        });
        if (badge.xpReward > 0) {
          await tx.xPTransaction.create({
            data: {
              userId,
              amount: badge.xpReward,
              reason: "badge",
              referenceId: check.id,
            },
          });
          await tx.profile.update({
            where: { id: userId },
            data: { xp: { increment: badge.xpReward } },
          });
        }
        await tx.notification.create({
          data: {
            userId,
            type: "badge",
            title: `Badge Earned: ${badge.name}`,
            message: `${badge.description} — +${badge.xpReward} XP`,
            link: "/dashboard/achievements",
          },
        });
        newlyAwarded.push({
          id: badge.id,
          name: badge.name,
          description: badge.description,
          icon: badge.iconUrl ?? "🏅",
          xpReward: badge.xpReward,
        });
      }
    }
  }

  return newlyAwarded;
}
