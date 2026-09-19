import { NextResponse } from "next/server";
import { z } from "zod";
import { getUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";

const generatePathSchema = z.object({
  worldId: z.string(),
  styleId: z.string().optional(),
});

export async function POST(request: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = generatePathSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { worldId, styleId } = parsed.data;

  const profile = await prisma.studentLearningProfile.findUnique({
    where: { userId },
    include: { learningStyle: true },
  });

  let styleName = "reading";
  const preferredDifficulty = profile?.preferredDifficulty ?? 2;
  if (styleId) {
    const style = await prisma.learningStyle.findUnique({ where: { id: styleId } });
    if (style) styleName = style.name;
  } else {
    styleName = profile?.learningStyle?.name ?? "reading";
  }

  const islands = await prisma.island.findMany({
    where: { worldId },
    orderBy: { order: "asc" },
    include: {
      concepts: { orderBy: { order: "asc" } },
      progresses: { where: { userId } },
    },
  });

  const path = [];
  let hasReachedUnlocked = false;
  for (const island of islands) {
    const progress = island.progresses[0];
    if (progress?.status === "completed") {
      path.push({
        islandId: island.id,
        islandTitle: island.title,
        status: "completed",
        concepts: island.concepts.map((c) => ({
          id: c.id, title: c.title, difficulty: c.difficulty,
          format: styleName === "visual" ? "video" :
                  styleName === "auditory" ? "audio" :
                  styleName === "kinesthetic" ? "interactive" : "text",
        })),
      });
    } else if (
      !hasReachedUnlocked &&
      (progress?.status === "in_progress" || progress?.status === "unlocked" || !progress)
    ) {
      hasReachedUnlocked = true;
      path.push({
        islandId: island.id,
        islandTitle: island.title,
        status: progress?.status ?? "unlocked",
        concepts: island.concepts.map((c) => ({
          id: c.id, title: c.title, difficulty: c.difficulty,
          format: styleName === "visual" ? "video" :
                  styleName === "auditory" ? "audio" :
                  styleName === "kinesthetic" ? "interactive" : "text",
        })),
      });
    } else {
      path.push({
        islandId: island.id,
        islandTitle: island.title,
        status: "locked",
        concepts: island.concepts.map((c) => ({
          id: c.id, title: c.title, difficulty: c.difficulty,
          format: styleName === "visual" ? "video" :
                  styleName === "auditory" ? "audio" :
                  styleName === "kinesthetic" ? "interactive" : "text",
        })),
      });
    }
  }

  const masteryRecords = await prisma.skillMastery.findMany({
    where: { userId },
    include: { skill: true },
  });
  const avgMastery = masteryRecords.length > 0
    ? masteryRecords.reduce((sum, r) => sum + r.score, 0) / masteryRecords.length
    : 0;
  const adjustedDifficulty = Math.max(1, Math.min(5, Math.round(avgMastery * 5)));

  const contentTypes = styleName === "visual" ? ["diagrams", "animations", "videos"] :
                       styleName === "auditory" ? ["explanations", "narration"] :
                       styleName === "kinesthetic" ? ["code playgrounds", "challenges", "quizzes"] :
                       ["text", "code examples", "documentation"];

  return NextResponse.json({
    worldId,
    style: styleName,
    preferredDifficulty,
    adjustedDifficulty,
    avgMastery: Math.round(avgMastery * 100),
    path,
    recommendedContentTypes: contentTypes,
    generatedAt: new Date().toISOString(),
  });
}
