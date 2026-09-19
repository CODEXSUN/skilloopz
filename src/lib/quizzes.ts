import { prisma } from "@/lib/db";

export async function saveQuizAttempt(
  userId: string,
  lessonId: string,
  blockId: string,
  data: {
    score: number;
    total: number;
    answers: Record<string, unknown>;
    timeSpent: number;
  },
) {
  const existing = await prisma.lessonProgress.findUnique({
    where: { userId_lessonId: { userId, lessonId } },
  });

  const metadata = {
    quizAttempts: [
      {
        blockId,
        score: data.score,
        total: data.total,
        answers: data.answers,
        timeSpent: data.timeSpent,
        completedAt: new Date().toISOString(),
      },
    ],
  };

  if (existing) {
    const existingMeta = JSON.parse(existing.metadata || "{}");
    const attempts = existingMeta.quizAttempts ?? [];
    const existingAttempt = attempts.find(
      (a: { blockId: string }) => a.blockId === blockId,
    );

    if (existingAttempt) {
      existingAttempt.score = data.score;
      existingAttempt.total = data.total;
      existingAttempt.answers = data.answers;
      existingAttempt.timeSpent = data.timeSpent;
      existingAttempt.completedAt = new Date().toISOString();
    } else {
      attempts.push(metadata.quizAttempts[0]);
    }

    return prisma.lessonProgress.update({
      where: { id: existing.id },
      data: {
        score: data.total > 0 ? (data.score / data.total) * 100 : 0,
        metadata: JSON.stringify({ ...existingMeta, quizAttempts: attempts }),
      },
    });
  }

  const percentage = data.total > 0 ? (data.score / data.total) * 100 : 0;

  return prisma.lessonProgress.create({
    data: {
      userId,
      lessonId,
      status: "in_progress",
      score: percentage,
      metadata: JSON.stringify(metadata),
    },
  });
}

export async function getQuizAttempts(userId: string, lessonId: string) {
  const progress = await prisma.lessonProgress.findUnique({
    where: { userId_lessonId: { userId, lessonId } },
  });

  if (!progress?.metadata) return [];

  const meta = JSON.parse(progress.metadata);
  return meta.quizAttempts ?? [];
}
