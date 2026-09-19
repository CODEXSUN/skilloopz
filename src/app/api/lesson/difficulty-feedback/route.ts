import { NextResponse } from "next/server";
import { z } from "zod";
import { getUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { recordDifficultyRating } from "@/lib/learning/difficulty-tracker";
import { calculateDifficulty, type ScalerInput } from "@/lib/learning/difficulty-scaler";

const feedbackSchema = z.object({
  lessonId: z.string(),
  difficultyRating: z.enum(["too_easy", "just_right", "too_hard"]),
});

export async function POST(request: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = feedbackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { lessonId, difficultyRating } = parsed.data;

  recordDifficultyRating(lessonId, difficultyRating);

  const profile = await prisma.studentLearningProfile.findUnique({
    where: { userId },
  });

  const currentDifficulty = profile?.preferredDifficulty ?? 2;
  const diffAdjust =
    difficultyRating === "too_easy" ? -1 :
    difficultyRating === "too_hard" ? 1 : 0;
  const newDifficulty = Math.max(1, Math.min(5, currentDifficulty + diffAdjust));

  await prisma.studentLearningProfile.upsert({
    where: { userId },
    create: { userId, preferredDifficulty: newDifficulty },
    update: { preferredDifficulty: newDifficulty },
  });

  const scalerInput: ScalerInput = {
    lessonId,
    currentDifficulty: newDifficulty,
    masteryScore: profile?.memoryScore ?? 0.5,
    preferredDifficulty: newDifficulty,
    correctAnswers: 0,
    totalAnswers: 0,
  };

  const scalerResult = calculateDifficulty(scalerInput);

  return NextResponse.json({
    success: true,
    lessonId,
    rating: difficultyRating,
    previousDifficulty: currentDifficulty,
    recommendedDifficulty: scalerResult.recommendedDifficulty,
    adjustment: scalerResult.adjustment,
    reason: scalerResult.reason,
  });
}

export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.studentLearningProfile.findUnique({
    where: { userId },
    select: { preferredDifficulty: true },
  });

  return NextResponse.json({
    difficulty: profile?.preferredDifficulty ?? 2,
  });
}
