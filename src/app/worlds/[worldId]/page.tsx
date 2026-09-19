import { Metadata } from "next";
import { prisma } from "@/lib/db";
import { WorldDetailContent } from "@/components/worlds/world-detail-content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ worldId: string }>;
}): Promise<Metadata> {
  const { worldId } = await params;
  const world = await prisma.learningWorld.findUnique({ where: { id: worldId } });
  if (!world) return { title: "World not found" };
  return {
    title: world.title,
    description: world.description ?? `Explore ${world.title}`,
  };
}

export default function WorldDetailPage({
  params,
}: {
  params: Promise<{ worldId: string }>;
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <WorldDetailContent params={params} />
    </div>
  );
}