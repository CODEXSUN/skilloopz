import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserId } from "@/lib/auth";
import { calculateStreak } from "@/lib/gamification/streak-tracker";

export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.profile.findUnique({
    where: { id: userId },
    select: { currentStreak: true, longestStreak: true, lastActivityDate: true },
  });

  if (!profile) {
    return NextResponse.json({ streak: 0, longestStreak: 0, lastActivityDate: null, nextMilestone: 7 });
  }

  const nextMilestone = profile.currentStreak < 7
    ? 7
    : profile.currentStreak < 30
      ? 30
      : profile.currentStreak < 100
        ? 100
        : null;

  return NextResponse.json({
    streak: profile.currentStreak,
    longestStreak: profile.longestStreak,
    lastActivityDate: profile.lastActivityDate,
    nextMilestone,
  });
}
