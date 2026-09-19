import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.studentLearningProfile.findUnique({
    where: { userId },
    include: { learningStyle: true },
  });

  if (!profile) {
    return NextResponse.json(null);
  }

  return NextResponse.json({
    id: profile.id,
    userId: profile.userId,
    learningStyle: profile.learningStyle,
    preferredDifficulty: profile.preferredDifficulty,
    interests: profile.interests,
    attentionSpan: profile.attentionSpan,
    memoryScore: profile.memoryScore,
    quizCompleted: profile.quizCompleted,
    styleOverridden: profile.styleOverridden,
  });
}

export async function PUT(request: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const profile = await prisma.studentLearningProfile.upsert({
    where: { userId },
    update: {
      ...(body.learningStyleId !== undefined && { learningStyleId: body.learningStyleId, styleOverridden: true }),
      ...(body.preferredDifficulty !== undefined && { preferredDifficulty: body.preferredDifficulty }),
      ...(body.interests !== undefined && { interests: body.interests }),
      ...(body.attentionSpan !== undefined && { attentionSpan: body.attentionSpan }),
      ...(body.quizCompleted !== undefined && { quizCompleted: body.quizCompleted }),
    },
    create: {
      userId,
      learningStyleId: body.learningStyleId ?? null,
      preferredDifficulty: body.preferredDifficulty ?? 2,
      interests: body.interests ?? "[]",
    },
    include: { learningStyle: true },
  });

  return NextResponse.json(profile);
}