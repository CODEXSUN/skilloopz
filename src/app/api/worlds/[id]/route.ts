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
    include: {
      islands: {
        orderBy: { order: "asc" },
        include: {
          _count: { select: { concepts: true } },
        },
      },
    },
  });

  if (!world) {
    return NextResponse.json({ error: "World not found" }, { status: 404 });
  }

  let progressMap: Record<string, { status: string; progress: number; xpEarned: number }> = {};
  if (userId) {
    const progress = await prisma.worldProgress.findMany({
      where: { userId, islandId: { in: world.islands.map((i) => i.id) } },
    });
    for (const p of progress) {
      if (p.islandId) {
        progressMap[p.islandId] = { status: p.status, progress: p.progress, xpEarned: p.xpEarned };
      }
    }
  }

  const islands = world.islands.map((i) => ({
    id: i.id,
    title: i.title,
    description: i.description,
    icon: i.icon,
    color: i.color,
    order: i.order,
    conceptCount: i._count.concepts,
    requiredMastery: i.requiredMastery,
    progress: progressMap[i.id] ?? { status: "locked", progress: 0, xpEarned: 0 },
  }));

  return NextResponse.json({
    id: world.id,
    title: world.title,
    description: world.description,
    theme: world.theme,
    icon: world.icon,
    color: world.color,
    order: world.order,
    islands,
  });
}