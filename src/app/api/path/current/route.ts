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
  });

  const progress = await prisma.worldProgress.findMany({
    where: { userId, status: { not: "locked" } },
    include: { island: { include: { world: true, concepts: true } } },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  const nextIsland = progress.find((p) => p.status === "in_progress" || p.status === "unlocked");

  if (nextIsland) {
    return NextResponse.json({
      currentWorld: nextIsland.island?.world?.title ?? null,
      currentIsland: nextIsland.island?.title ?? null,
      islandId: nextIsland.islandId,
      worldId: nextIsland.island?.world?.id ?? null,
      progress: nextIsland.progress,
      status: nextIsland.status,
    });
  }

  const firstLocked = await prisma.worldProgress.findFirst({
    where: { userId, status: "locked" },
    orderBy: { updatedAt: "asc" },
    include: { island: { include: { world: true } } },
  });

  if (firstLocked) {
    return NextResponse.json({
      currentWorld: firstLocked.island?.world?.title ?? null,
      currentIsland: firstLocked.island?.title ?? null,
      islandId: firstLocked.islandId,
      worldId: firstLocked.island?.world?.id ?? null,
      progress: 0,
      status: "locked",
    });
  }

  const firstWorld = await prisma.learningWorld.findFirst({
    orderBy: { order: "asc" },
    include: { islands: { orderBy: { order: "asc" }, take: 1 } },
  });

  if (firstWorld && firstWorld.islands[0]) {
    return NextResponse.json({
      currentWorld: firstWorld.title,
      currentIsland: firstWorld.islands[0].title,
      islandId: firstWorld.islands[0].id,
      worldId: firstWorld.id,
      progress: 0,
      status: "unlocked",
    });
  }

  return NextResponse.json(null);
}