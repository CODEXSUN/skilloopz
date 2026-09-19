import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DashboardLeaderboardContent } from "@/components/dashboard/leaderboard-content";

const PERIODS = ["all", "week", "month"] as const;
type Period = (typeof PERIODS)[number];

function getDateRange(period: Period): Date | null {
  const now = new Date();
  if (period === "week") return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  if (period === "month") return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  return null;
}

export default async function DashboardLeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const user = await getUser();
  if (!user) return null;

  const params = await searchParams;
  const period = (PERIODS.includes(params.period as Period) ? params.period : "all") as Period;

  const since = getDateRange(period);
  const where = since ? { createdAt: { gte: since } } : {};

  let leaderboard: { id: string; fullName: string | null; avatarUrl: string | null; totalXp: number; level: number; streak: number }[] = [];
  let userRank = 0;

  try {
    const xpData = await prisma.xPTransaction.groupBy({
      by: ["userId"],
      _sum: { amount: true },
      where,
      orderBy: { _sum: { amount: "desc" } },
      take: 50,
    });

    const userIds = xpData.map((x) => x.userId);
    const profiles = await prisma.profile.findMany({
      where: { id: { in: userIds } },
      select: { id: true, fullName: true, avatarUrl: true, level: true, currentStreak: true },
    });

    const profileMap = new Map(profiles.map((p) => [p.id, p]));

    leaderboard = xpData.map((x) => ({
      id: x.userId,
      fullName: profileMap.get(x.userId)?.fullName ?? null,
      avatarUrl: profileMap.get(x.userId)?.avatarUrl ?? null,
      totalXp: x._sum.amount ?? 0,
      level: profileMap.get(x.userId)?.level ?? 1,
      streak: profileMap.get(x.userId)?.currentStreak ?? 0,
    }));

    userRank = leaderboard.findIndex((e) => e.id === user.id) + 1;
  } catch {
    // Not available
  }

  return <DashboardLeaderboardContent leaderboard={leaderboard} currentUserId={user.id} userRank={userRank} period={period} />;
}
