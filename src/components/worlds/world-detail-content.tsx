"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { IslandCard } from "./island-card";
import { WorldProgressBar } from "./world-progress-bar";
import { WorldCompletionCelebration } from "./world-completion-celebration";
import { LearningPathVisualization } from "./learning-path-visualization";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { ErrorState } from "@/components/ui/error-state";
import { StaggerContainer, StaggerItem } from "@/components/ui/motion";

interface Island {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  order: number;
  conceptCount: number;
  requiredMastery: number;
  progress: { status: string; progress: number; xpEarned: number };
}

interface WorldDetail {
  id: string;
  title: string;
  description: string | null;
  theme: string;
  icon: string | null;
  color: string | null;
  order: number;
  islands: Island[];
}

export function WorldDetailContent({ params }: { params: Promise<{ worldId: string }> }) {
  const { worldId } = use(params);

  const { data: world, isLoading, error } = useQuery<WorldDetail>({
    queryKey: ["world", worldId],
    queryFn: async () => {
      const res = await fetch(`/api/worlds/${worldId}`);
      if (!res.ok) throw new Error("Failed to fetch world");
      return res.json();
    },
  });

  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorState message={error.message} />;
  if (!world) return <ErrorState message="World not found" />;

  const allCompleted = world.islands.length > 0 && world.islands.every((i) => i.progress.status === "completed");
  const totalXp = world.islands.reduce((sum, i) => sum + i.progress.xpEarned, 0);

  return (<>
    <WorldCompletionCelebration
      worldTitle={world.title}
      worldColor={world.color}
      islandCount={world.islands.length}
      xpEarned={totalXp}
      show={allCompleted}
    />
    <div className="mx-auto max-w-4xl space-y-8">
      <Link
        href="/worlds"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to worlds
      </Link>

      <div className="flex items-center gap-6">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-2xl text-4xl"
          style={{ backgroundColor: world.color ? `${world.color}20` : "rgba(59,130,246,0.1)" }}
        >
          {world.icon ?? "🌍"}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">{world.title}</h1>
          {world.description && (
            <p className="mt-2 text-muted-foreground">{world.description}</p>
          )}
        </div>
      </div>

      {world.islands.length > 0 && (
        <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-6">
          <h2 className="mb-6 text-lg font-semibold text-foreground">Progress</h2>
          <WorldProgressBar
            islands={world.islands.map((i) => ({ id: i.id, title: i.title, status: i.progress.status, color: i.color }))}
          />
        </div>
      )}

      {world.islands.length > 0 && (
        <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-6">
          <LearningPathVisualization worldId={world.id} />
        </div>
      )}

      <div>
        <h2 className="mb-4 text-xl font-semibold text-foreground">Islands</h2>
        <StaggerContainer>
          <div className="grid gap-4 sm:grid-cols-2">
            {world.islands.map((island) => (
              <StaggerItem key={island.id}>
                <IslandCard worldId={world.id} {...island} />
              </StaggerItem>
            ))}
          </div>
        </StaggerContainer>
      </div>
    </div>
  </>);
}