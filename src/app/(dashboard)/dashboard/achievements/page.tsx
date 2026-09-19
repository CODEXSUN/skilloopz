import { getUser } from "@/lib/auth";
import { DashboardAchievementsContent } from "@/components/dashboard/achievements-content";
import { BADGES } from "@/lib/gamification/badges";
import { ACHIEVEMENTS } from "@/lib/gamification/achievements";
import { prisma } from "@/lib/db";

export default async function DashboardAchievementsPage() {
  const user = await getUser();
  if (!user) return null;

  let earnedAchievementIds = new Set<string>();
  let earnedBadgeIds = new Set<string>();
  let totalXp = 0;

  try {
    [earnedAchievementIds, earnedBadgeIds, totalXp] = await Promise.all([
      prisma.userAchievement.findMany({ where: { userId: user.id } }).then((u) => new Set(u.map((ua) => ua.achievementId))),
      prisma.userBadge.findMany({ where: { userId: user.id } }).then((u) => new Set(u.map((ub) => ub.badgeId))),
      prisma.xPTransaction.aggregate({ where: { userId: user.id }, _sum: { amount: true } }).then((r) => r._sum.amount ?? 0),
    ]);
  } catch {
    // Not available
  }

  const achievements = ACHIEVEMENTS.map((a) => ({
    id: a.id,
    name: a.name,
    description: a.description,
    iconUrl: a.icon ?? null,
    xpReward: a.xpReward,
    earned: earnedAchievementIds.has(a.id),
  }));

  const badges = BADGES.map((b) => ({
    id: b.id,
    name: b.name,
    description: b.description,
    iconUrl: b.icon,
    category: b.category,
    rarity: b.rarity,
    xpReward: b.xpReward,
    earned: earnedBadgeIds.has(b.id),
  }));

  return <DashboardAchievementsContent achievements={achievements} earnedAchievementIds={earnedAchievementIds} badges={badges} earnedBadgeIds={earnedBadgeIds} totalXp={totalXp} />;
}
