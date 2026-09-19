import { NextResponse } from "next/server";
import { z } from "zod";

import { getUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { calculateStreak } from "@/lib/gamification/streak-tracker";
import { getLevelInfo, XP_REWARDS, calculateXP } from "@/lib/gamification/xp-calculator";
import { checkAndAwardAchievements } from "@/lib/gamification/achievement-service";
import type { NewAchievement } from "@/lib/gamification/achievement-service";
import { checkAndAwardBadges } from "@/lib/gamification/badge-service";
import type { NewBadge } from "@/lib/gamification/badge-service";
import { getActiveMultiplier, trackSeasonalProgress } from "@/lib/gamification/seasonal-event-service";
import { updateLessonMastery } from "@/lib/gamification/mastery-service";
import { recalculateEnrollmentProgress } from "@/lib/courses/enrollment-service";
import { awardCourseCompletion } from "@/lib/courses/completion-service";
import { updateContinueLearning } from "@/lib/courses/continue-learning";
import { checkAndSendParentAlerts } from "@/lib/parent-alerts";

const upsertProgressSchema = z.object({
  status: z.enum(["not_started", "in_progress", "completed"]).optional(),
  timeSpent: z.number().int().min(0).optional(),
  score: z.number().min(0).max(100).optional(),
  lastBlockIndex: z.number().int().min(0).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const userId = await getUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const progress = await prisma.lessonProgress.findUnique({
    where: { userId_lessonId: { userId, lessonId: id } },
  });

  return NextResponse.json(progress ?? { status: "not_started", timeSpent: 0 });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const userId = await getUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = upsertProgressSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const existing = await prisma.lessonProgress.findUnique({
    where: { userId_lessonId: { userId, lessonId: id } },
  });

  const isNewCompletion =
    parsed.data.status === "completed" && existing?.status !== "completed";

  const progress = existing
    ? await prisma.lessonProgress.update({
        where: { id: existing.id },
        data: {
          ...(parsed.data.status && { status: parsed.data.status }),
          ...(parsed.data.timeSpent !== undefined && { timeSpent: parsed.data.timeSpent }),
          ...(parsed.data.score !== undefined && { score: parsed.data.score }),
          ...(parsed.data.lastBlockIndex !== undefined && { lastBlockIndex: parsed.data.lastBlockIndex }),
          ...(parsed.data.metadata && { metadata: JSON.stringify(parsed.data.metadata) }),
        },
      })
    : await prisma.lessonProgress.create({
        data: {
          userId,
          lessonId: id,
          status: parsed.data.status ?? "in_progress",
          timeSpent: parsed.data.timeSpent ?? 0,
          score: parsed.data.score,
          lastBlockIndex: parsed.data.lastBlockIndex ?? 0,
          metadata: parsed.data.metadata ? JSON.stringify(parsed.data.metadata) : "{}",
        },
      });

  let xpAwarded = 0;
  let streak = 0;
  let longestStreak = 0;
  let level = 0;
  let courseCompleted = false;
  let newAchievements: NewAchievement[] = [];
  let newBadges: NewBadge[] = [];
  let seasonalBonus = 0;
  let activeSeasonalEvent: string | undefined;
  let masteryUpdates: Awaited<ReturnType<typeof updateLessonMastery>> = [];

  if (isNewCompletion) {
    const result = await awardLessonXp(userId, id);
    xpAwarded = result.xpAwarded;
    streak = result.streak;
    longestStreak = result.longestStreak;
    level = result.level;
    newAchievements = result.newAchievements;
    newBadges = result.newBadges;
    seasonalBonus = result.seasonalBonus;
    activeSeasonalEvent = result.activeSeasonalEvent;

    if (parsed.data.score !== undefined) {
      masteryUpdates = await updateLessonMastery(userId, id, parsed.data.score / 100);
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id },
      select: { module: { select: { courseId: true } } },
    });

    if (lesson) {
      const courseId = lesson.module.courseId;

      await updateContinueLearning(userId, courseId, id);
      await recalculateEnrollmentProgress(userId, courseId);

      const completion = await awardCourseCompletion(userId, courseId);
      courseCompleted = !completion.alreadyCompleted && completion.xpAwarded > 0;
    }

    await checkAndSendParentAlerts(userId);
  }

  return NextResponse.json({
    progress,
    xpAwarded,
    streak,
    longestStreak,
    level,
    courseCompleted,
    newAchievements: newAchievements.length > 0 ? newAchievements : undefined,
    newBadges: newBadges.length > 0 ? newBadges : undefined,
    seasonalBonus: seasonalBonus > 0 ? seasonalBonus : undefined,
    activeSeasonalEvent,
    masteryUpdates: masteryUpdates.length > 0 ? masteryUpdates.map((m) => ({
      skill: m.skill,
      score: m.mastery.score,
      difficulty: m.mastery.difficulty,
    })) : undefined,
  });
}

async function awardLessonXp(userId: string, lessonId: string) {
  return await prisma.$transaction(async (tx) => {
    const alreadyAwarded = await tx.xPTransaction.findFirst({
      where: { userId, reason: "lesson_completed", lessonId },
    });

    if (alreadyAwarded) {
      const profile = await tx.profile.findUnique({ where: { id: userId } });
      return {
        xpAwarded: 0,
        streak: profile?.currentStreak ?? 0,
        longestStreak: profile?.longestStreak ?? 0,
        level: profile?.level ?? 1,
        newAchievements: [] as NewAchievement[],
        newBadges: [] as NewBadge[],
        seasonalBonus: 0,
        activeSeasonalEvent: undefined,
      };
    }

    const lesson = await tx.lesson.findUnique({
      where: { id: lessonId },
      include: { module: { include: { course: { select: { difficulty: true, estimatedMinutes: true } } } } },
    });

    const progress = await tx.lessonProgress.findUnique({
      where: { userId_lessonId: { userId, lessonId } },
      select: { score: true, timeSpent: true },
    });

    const baseXp = XP_REWARDS.LESSON_COMPLETE;
    const difficulty = (lesson?.module.course.difficulty ?? "beginner") as "beginner" | "intermediate" | "advanced" | "expert";
    const isFirstTry = progress?.score === 100;
    const isPerfectQuiz = (progress?.score ?? 0) >= 100;
    const isSpeedCompletion = lesson?.module.course.estimatedMinutes
      ? (progress?.timeSpent ?? 0) <= lesson.module.course.estimatedMinutes * 60 * 0.5
      : false;

    const profile = await tx.profile.findUnique({ where: { id: userId } });
    const streak = profile?.currentStreak ?? 0;

    const xpResult = calculateXP(baseXp, {
      difficulty,
      isFirstTry,
      streak,
      isPerfectQuiz,
      isSpeedCompletion,
    });

    const seasonalMultiplier = getActiveMultiplier();
    const finalXp = Math.round(xpResult.totalXp * seasonalMultiplier);

    await tx.xPTransaction.create({
      data: {
        userId,
        amount: finalXp,
        reason: "lesson_completed",
        lessonId,
      },
    });

    const newXp = (profile?.xp ?? 0) + finalXp;
    const levelInfo = getLevelInfo(newXp);

    const streakResult = calculateStreak(
      profile?.lastActivityDate ?? null,
      profile?.currentStreak ?? 0,
      profile?.longestStreak ?? 0,
    );

    const oldLevel = profile?.level ?? 1;

    await tx.profile.update({
      where: { id: userId },
      data: {
        xp: newXp,
        level: levelInfo.level,
        currentStreak: streakResult.streak,
        longestStreak: streakResult.longestStreak,
        lastActivityDate: streakResult.lastActivityDate,
      },
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

    const STREAK_MILESTONES = [3, 7, 14, 30, 50, 100];
    if (
      streakResult.streak > (profile?.currentStreak ?? 0)
      && STREAK_MILESTONES.includes(streakResult.streak)
    ) {
      await tx.notification.create({
        data: {
          userId,
          type: "streak_milestone",
          title: `🔥 ${streakResult.streak}-Day Streak!`,
          message: `You're on a ${streakResult.streak}-day learning streak. Keep going!`,
          link: "/dashboard",
        },
      });
    }

    if (xpResult.multipliers.length > 1) {
      await tx.notification.create({
        data: {
          userId,
          type: "xp_bonus",
          title: `+${finalXp} XP!`,
          message: `Bonus multipliers applied: ${xpResult.multipliers.slice(1).map((m) => m.name).join(", ")}`,
          link: "/dashboard",
        },
      });
    }

    const newAchievements = await checkAndAwardAchievements(userId, tx);
    const newBadges = await checkAndAwardBadges(userId, tx);
    const seasonalBonuses = await trackSeasonalProgress(userId, tx);
    const totalSeasonalBonus = seasonalBonuses.reduce((sum, b) => sum + b.xpBonus, 0);
    const activeEventName = seasonalBonuses.length > 0 ? seasonalBonuses[0].event : undefined;

    return {
      xpAwarded: finalXp,
      streak: streakResult.streak,
      longestStreak: streakResult.longestStreak,
      level: levelInfo.level,
      newAchievements,
      newBadges,
      seasonalBonus: totalSeasonalBonus,
      activeSeasonalEvent: activeEventName,
    };
  });
}
