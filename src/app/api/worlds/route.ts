import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const userId = await getUserId();

  const worlds = await prisma.learningWorld.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
    include: {
      _count: { select: { islands: true } },
    },
  });

  let progressMap: Record<string, { completed: number; total: number }> = {};
  if (userId) {
    const progress = await prisma.worldProgress.findMany({
      where: { userId },
      include: { island: { select: { worldId: true } } },
    });
    for (const p of progress) {
      const wid = p.island?.worldId;
      if (!wid) continue;
      if (!progressMap[wid]) progressMap[wid] = { completed: 0, total: 0 };
      if (p.status === "completed") progressMap[wid].completed++;
      progressMap[wid].total++;
    }
  }

  const result = worlds.map((w) => ({
    id: w.id,
    title: w.title,
    description: w.description,
    theme: w.theme,
    icon: w.icon,
    color: w.color,
    order: w.order,
    islandCount: w._count.islands,
    progress: progressMap[w.id] ?? null,
  }));

  return NextResponse.json(result, {
    headers: { "Cache-Control": "public, max-age=60, s-maxage=120" },
  });
}