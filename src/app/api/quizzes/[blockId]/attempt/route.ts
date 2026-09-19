import { NextResponse } from "next/server";
import { z } from "zod";

import { getUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { saveQuizAttempt } from "@/lib/quizzes";
import { getLevelInfo, XP_REWARDS } from "@/lib/gamification/xp-calculator";
import { checkAndAwardAchievements } from "@/lib/gamification/achievement-service";
import type { NewAchievement } from "@/lib/gamification/achievement-service";
import { checkAndAwardBadges } from "@/lib/gamification/badge-service";
import type { NewBadge } from "@/lib/gamification/badge-service";

const attemptSchema = z.object({
  lessonId: z.string().uuid(),
  score: z.number().int().min(0),
  total: z.number().int().min(1),
  answers: z.record(z.string(), z.unknown()),
  timeSpent: z.number().int().min(0),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ blockId: string }> },
) {
  const { blockId } = await params;

  const userId = await getUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = attemptSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const attempt = await saveQuizAttempt(userId, parsed.data.lessonId, blockId, {
    score: parsed.data.score,
    total: parsed.data.total,
    answers: parsed.data.answers,
    timeSpent: parsed.data.timeSpent,
  });

  const percentage = parsed.data.total > 0
    ? (parsed.data.score / parsed.data.total) * 100
    : 0;

  let xpAwarded = 0;
  let level = 0;
  let newAchievements: NewAchievement[] = [];
  let newBadges: NewBadge[] = [];

  if (percentage >= 80) {
    const result = await awardQuizPassXp(userId, parsed.data.lessonId, blockId, percentage);
    xpAwarded = result.xpAwarded;
    level = result.level;
    newAchievements = result.newAchievements;
    newBadges = result.newBadges;
  }

  const passed = percentage >= 80;
  await prisma.notification.create({
    data: {
      userId,
      type: "quiz_result",
      title: passed ? "Quiz Passed!" : "Quiz Attempted",
      message: passed
        ? `You scored ${parsed.data.score}/${parsed.data.total} (${Math.round(percentage)}%) — +${xpAwarded} XP!`
        : `You scored ${parsed.data.score}/${parsed.data.total} (${Math.round(percentage)}%)`,
      link: `/lessons/${parsed.data.lessonId}`,
    },
  });

  return NextResponse.json(
    { ...attempt, xpAwarded, level, newAchievements: newAchievements.length > 0 ? newAchievements : undefined, newBadges: newBadges.length > 0 ? newBadges : undefined },
    { status: 201 },
  );
}

async function awardQuizPassXp(
  userId: string,
  lessonId: string,
  blockId: string,
  percentage: number,
) {
  return await prisma.$transaction(async (tx) => {
    const alreadyAwarded = await tx.xPTransaction.findFirst({
      where: {
        userId,
        reason: "quiz_pass",
        lessonId,
        referenceId: blockId,
      },
    });

    if (alreadyAwarded) {
      const profile = await tx.profile.findUnique({ where: { id: userId } });
      return {
        xpAwarded: 0,
        level: profile?.level ?? 1,
        newAchievements: [] as NewAchievement[],
        newBadges: [] as NewBadge[],
      };
    }

    await tx.xPTransaction.create({
      data: {
        userId,
        amount: XP_REWARDS.QUIZ_PASS,
        reason: "quiz_pass",
        lessonId,
        referenceId: blockId,
      },
    });

    const profile = await tx.profile.findUnique({ where: { id: userId } });
    const newXp = (profile?.xp ?? 0) + XP_REWARDS.QUIZ_PASS;
    const levelInfo = getLevelInfo(newXp);
    const oldLevel = profile?.level ?? 1;

    await tx.profile.update({
      where: { id: userId },
      data: { xp: newXp, level: levelInfo.level },
    });

    if (levelInfo.level > oldLevel) {
      await tx.notification.create({
        data: {
          userId,
          type: "level_up",
          title: `Level ${levelInfo.level}!`,
          message: `You reached Level ${levelInfo.level} — ${levelInfo.title}`,
          link: "/dashboard",
        },
      });
    }

    const newAchievements = percentage >= 100
      ? await checkAndAwardAchievements(userId, tx)
      : [];
    const newBadges = await checkAndAwardBadges(userId, tx);

    return {
      xpAwarded: XP_REWARDS.QUIZ_PASS,
      level: levelInfo.level,
      newAchievements,
      newBadges,
    };
  });
}
