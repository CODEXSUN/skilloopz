import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        include: {
          modules: {
            include: {
              lessons: {
                include: {
                  progress: { where: { userId } },
                },
              },
            },
          },
        },
      },
    },
  });

  let videoMinutes = 0;
  let readingMinutes = 0;
  let practiceCount = 0;
  let audioMinutes = 0;

  for (const enrollment of enrollments) {
    for (const mod of enrollment.course.modules) {
      for (const lesson of mod.lessons) {
        for (const p of lesson.progress) {
          if (p.timeSpent) {
            const tags = p.metadata ? JSON.parse(p.metadata) : {};
            if (tags.mediaType === "video") videoMinutes += p.timeSpent;
            else if (tags.mediaType === "audio") audioMinutes += p.timeSpent;
            else readingMinutes += p.timeSpent;
          }
          if (p.status === "completed" || (p.score && p.score > 0)) {
            practiceCount++;
          }
        }
      }
    }
  }

  const styleScores = [
    { id: "style-visual", score: videoMinutes },
    { id: "style-auditory", score: audioMinutes },
    { id: "style-reading", score: readingMinutes },
    { id: "style-kinesthetic", score: practiceCount },
  ];

  styleScores.sort((a, b) => b.score - a.score);
  const detectedStyleId = styleScores[0].score > 0 ? styleScores[0].id : null;

  if (detectedStyleId) {
    await prisma.studentLearningProfile.upsert({
      where: { userId },
      update: { learningStyleId: detectedStyleId },
      create: { userId, learningStyleId: detectedStyleId },
    });
  }

  return NextResponse.json({
    detected: detectedStyleId,
    scores: styleScores,
  });
}