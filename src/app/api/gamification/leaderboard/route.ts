import { NextResponse } from "next/server";

import { getUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";

const PERIODS = ["all", "week", "month"] as const;
type Period = (typeof PERIODS)[number];

function getDateRange(period: Period): Date | null {
  const now = new Date();
  if (period === "week") {
    return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }
  if (period === "month") {
    return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
  return null;
}

export async function GET(request: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const period = (searchParams.get("period") ?? "all") as Period;
  const validPeriod = PERIODS.includes(period) ? period : "all";

  const since = getDateRange(validPeriod);

  const where = since ? { createdAt: { gte: since } } : {};

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
    select: { id: true, fullName: true, avatarUrl: true, xp: true, level: true, currentStreak: true },
  });

  const profileMap = new Map(profiles.map((p) => [p.id, p]));

  const leaderboard = xpData.map((x) => {
    const profile = profileMap.get(x.userId);
    return {
      id: x.userId,
      fullName: profile?.fullName ?? null,
      avatarUrl: profile?.avatarUrl ?? null,
      totalXp: x._sum.amount ?? 0,
      level: profile?.level ?? 1,
      streak: profile?.currentStreak ?? 0,
    };
  });

  const userRank = leaderboard.findIndex((e) => e.id === userId) + 1;

  let userPeriodXp = 0;
  if (userRank <= 0) {
    const userXp = await prisma.xPTransaction.aggregate({
      where: { userId, ...where },
      _sum: { amount: true },
    });
    userPeriodXp = userXp._sum.amount ?? 0;
  }

  return NextResponse.json({
    leaderboard,
    userRank: userRank > 0 ? userRank : null,
    userPeriodXp,
    period: validPeriod,
  });
}
