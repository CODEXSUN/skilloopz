import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const world = await prisma.learningWorld.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!world) {
    return NextResponse.json({ error: "World not found" }, { status: 404 });
  }

  const islandIds = await prisma.island.findMany({
    where: { worldId: id },
    select: { id: true },
  });

  const concepts = await prisma.concept.findMany({
    where: { islandId: { in: islandIds.map((i) => i.id) } },
    include: {
      prerequisites: { select: { prerequisiteId: true } },
      dependents: { select: { conceptId: true } },
    },
    orderBy: { order: "asc" },
  });

  const nodes = concepts.map((c) => ({
    id: c.id,
    title: c.title,
    difficulty: c.difficulty,
    domain: c.domain,
    icon: c.icon,
    color: c.color,
    order: c.order,
    islandId: c.islandId,
  }));

  const edges: { from: string; to: string }[] = [];
  for (const c of concepts) {
    for (const p of c.prerequisites) {
      edges.push({ from: p.prerequisiteId, to: c.id });
    }
  }

  return NextResponse.json({ nodes, edges }, {
    headers: { "Cache-Control": "public, max-age=60, s-maxage=120" },
  });
}