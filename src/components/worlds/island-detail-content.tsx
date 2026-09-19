"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft, BookOpen, Circle, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { StaggerContainer, StaggerItem } from "@/components/ui/motion";

interface Concept {
  id: string;
  title: string;
  difficulty: number;
  prerequisiteIds: string[];
}

interface IslandDetail {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  conceptCount: number;
  requiredMastery: number;
  concepts: Concept[];
  progress: { status: string; progress: number };
}

export function IslandDetailContent({ params }: { params: Promise<{ worldId: string; islandId: string }> }) {
  const { worldId, islandId } = use(params);

  const { data: islands, isLoading, error } = useQuery<IslandDetail[]>({
    queryKey: ["world-islands", worldId],
    queryFn: async () => {
      const res = await fetch(`/api/worlds/${worldId}/islands`);
      if (!res.ok) throw new Error("Failed to fetch islands");
      return res.json();
    },
  });

  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorState message={error.message} />;

  const island = islands?.find((i) => i.id === islandId);
  if (!island) return <ErrorState message="Island not found" />;

  const isLocked = island.progress.status === "locked";

  const difficultyLabel = (d: number) => {
    if (d <= 1) return "Beginner";
    if (d <= 2) return "Easy";
    if (d <= 3) return "Intermediate";
    if (d <= 4) return "Advanced";
    return "Expert";
  };

  const difficultyColor = (d: number) => {
    if (d <= 1) return "text-green-400";
    if (d <= 2) return "text-blue-400";
    if (d <= 3) return "text-yellow-400";
    if (d <= 4) return "text-orange-400";
    return "text-red-400";
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <Link
        href={`/worlds/${worldId}`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to world
      </Link>

      <div className="flex items-center gap-5">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
          style={{ backgroundColor: island.color ? `${island.color}20` : "rgba(99,102,241,0.1)" }}
        >
          {island.icon ?? "🏝️"}
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">{island.title}</h1>
            {isLocked && <Lock className="h-5 w-5 text-muted-foreground" />}
          </div>
          {island.description && (
            <p className="mt-1 text-muted-foreground">{island.description}</p>
          )}
          <p className="mt-1 text-sm text-muted-foreground">
            {island.conceptCount} concepts · {Math.round(island.requiredMastery * 100)}% mastery required
          </p>
        </div>
      </div>

      {isLocked ? (
        <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-8 text-center">
          <Lock className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h2 className="mt-4 text-lg font-semibold text-foreground">Island Locked</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Complete the previous islands to unlock this content.
          </p>
        </div>
      ) : (
        <div>
          <h2 className="mb-4 text-xl font-semibold text-foreground">Concepts</h2>
          {island.concepts.length === 0 ? (
            <EmptyState icon={BookOpen} title="No concepts yet" description="This island has no concepts defined." />
          ) : (
            <StaggerContainer>
              <div className="space-y-2">
                {island.concepts.map((concept) => (
                  <StaggerItem key={concept.id}>
                    <div
                      className={cn(
                        "flex items-center gap-4 rounded-xl border border-[rgba(255,255,255,0.06)] p-4 transition-colors",
                        "bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.04)]",
                      )}
                    >
                      <Circle className="h-5 w-5 shrink-0 text-muted-foreground/40" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground">{concept.title}</p>
                        <p className={cn("text-xs", difficultyColor(concept.difficulty))}>
                          {difficultyLabel(concept.difficulty)}
                        </p>
                      </div>
                    </div>
                  </StaggerItem>
                ))}
              </div>
            </StaggerContainer>
          )}
        </div>
      )}
    </div>
  );
}