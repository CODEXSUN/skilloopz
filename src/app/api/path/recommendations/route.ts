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

  const progress = await prisma.worldProgress.findMany({
    where: { userId, status: "in_progress" },
    include: {
      island: {
        include: {
          concepts: {
            include: {
              prerequisites: { select: { prerequisiteId: true } },
            },
            orderBy: { order: "asc" },
          },
          world: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 3,
  });

  const level = profile?.preferredDifficulty ?? 2;
  const style = profile?.learningStyle?.name ?? null;

  const recommendations = progress.flatMap((p) => {
    const island = p.island;
    if (!island) return [];
    return island.concepts
      .filter((c) => c.difficulty <= level + 1)
      .slice(0, 3)
      .map((c) => ({
        conceptId: c.id,
        conceptTitle: c.title,
        islandId: island.id,
        islandTitle: island.title,
        worldTitle: island.world?.title ?? null,
        difficulty: c.difficulty,
        reason: style === "visual" ? "Recommended based on your visual learning style" :
                style === "reading" ? "Concept available in text format" :
                style === "kinesthetic" ? "Interactive concept for hands-on learners" :
                "Next in your learning path",
      }));
  });

  const completedIslands = await prisma.worldProgress.count({
    where: { userId, status: "completed" },
  });

  return NextResponse.json({
    recommendations: recommendations.slice(0, 5),
    totalCompleted: completedIslands,
    learningStyle: style,
    preferredLevel: level,
  });
}