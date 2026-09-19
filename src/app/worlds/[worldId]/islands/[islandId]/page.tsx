import { Metadata } from "next";
import { prisma } from "@/lib/db";
import { IslandDetailContent } from "@/components/worlds/island-detail-content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ worldId: string; islandId: string }>;
}): Promise<Metadata> {
  const { islandId } = await params;
  const island = await prisma.island.findUnique({ where: { id: islandId } });
  if (!island) return { title: "Island not found" };
  return {
    title: island.title,
    description: island.description ?? `Explore ${island.title}`,
  };
}

export default function IslandDetailPage({
  params,
}: {
  params: Promise<{ worldId: string; islandId: string }>;
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <IslandDetailContent params={params} />
    </div>
  );
}