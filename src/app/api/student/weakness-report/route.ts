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
    select: { memoryScore: true, attentionSpan: true },
  });

  const progress = await prisma.worldProgress.findMany({
    where: { userId },
    include: {
      island: {
        include: {
          concepts: {
            include: {
              dependents: { select: { conceptId: true } },
            },
          },
        },
      },
    },
  });

  const weakAreas: {
    islandId: string;
    islandTitle: string;
    score: number;
    gaps: string[];
    concepts: string[];
  }[] = [];

  for (const p of progress) {
    const island = p.island;
    if (!island || p.status === "completed") continue;

    const gapConceptIds = new Set<string>();
    for (const concept of island.concepts) {
      for (const dep of concept.dependents) {
        if (!island.concepts.some((c) => c.id === dep.conceptId)) {
          gapConceptIds.add(concept.id);
        }
      }
    }

    if (p.status === "in_progress" || gapConceptIds.size > 0) {
      weakAreas.push({
        islandId: island.id,
        islandTitle: island.title,
        score: p.progress,
        gaps: Array.from(gapConceptIds),
        concepts: island.concepts.map((c) => c.title),
      });
    }
  }

  weakAreas.sort((a, b) => a.score - b.score);

  return NextResponse.json({
    weakAreas: weakAreas.slice(0, 5),
    memoryScore: profile?.memoryScore ?? 0.5,
    attentionSpan: profile?.attentionSpan ?? 20,
    totalWeak: weakAreas.length,
  });
}