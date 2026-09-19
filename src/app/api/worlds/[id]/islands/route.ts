import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const userId = await getUserId();

  const world = await prisma.learningWorld.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!world) {
    return NextResponse.json({ error: "World not found" }, { status: 404 });
  }

  const islands = await prisma.island.findMany({
    where: { worldId: id },
    orderBy: { order: "asc" },
    include: {
      _count: { select: { concepts: true } },
      concepts: {
        select: { id: true, title: true, difficulty: true, prerequisites: { select: { prerequisiteId: true } } },
        orderBy: { order: "asc" },
      },
    },
  });

  let progressMap: Record<string, { status: string; progress: number }> = {};
  if (userId) {
    const progress = await prisma.worldProgress.findMany({
      where: { userId, islandId: { in: islands.map((i) => i.id) } },
    });
    for (const p of progress) {
      if (p.islandId) progressMap[p.islandId] = { status: p.status, progress: p.progress };
    }
  }

  const result = islands.map((i) => ({
    id: i.id,
    title: i.title,
    description: i.description,
    icon: i.icon,
    color: i.color,
    order: i.order,
    conceptCount: i._count.concepts,
    requiredMastery: i.requiredMastery,
    concepts: i.concepts.map((c) => ({
      id: c.id,
      title: c.title,
      difficulty: c.difficulty,
      prerequisiteIds: c.prerequisites.map((p) => p.prerequisiteId),
    })),
    progress: progressMap[i.id] ?? { status: "locked", progress: 0 },
  }));

  return NextResponse.json(result, {
    headers: { "Cache-Control": "public, max-age=60, s-maxage=120" },
  });
}