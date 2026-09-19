"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Headphones, Lock, Monitor, BookOpen, Code, Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { ErrorState } from "@/components/ui/error-state";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface PathConcept {
  id: string;
  title: string;
  difficulty: number;
  format: string;
}

interface PathIsland {
  islandId: string;
  islandTitle: string;
  status: string;
  concepts: PathConcept[];
}

interface PathData {
  worldId: string;
  style: string;
  path: PathIsland[];
  recommendedContentTypes: string[];
  generatedAt: string;
}

const formatIcons: Record<string, typeof BookOpen> = {
  video: Monitor,
  audio: Headphones,
  interactive: Code,
  text: BookOpen,
};

const formatLabels: Record<string, string> = {
  video: "Video",
  audio: "Audio",
  interactive: "Practice",
  text: "Reading",
};

const styleLabels: Record<string, string> = {
  visual: "Visual Learner",
  auditory: "Auditory Learner",
  kinesthetic: "Hands-on Learner",
  reading: "Reading Learner",
};

export function LearningPathVisualization({ worldId }: { worldId: string }) {
  const { data, isLoading, error } = useQuery<PathData>({
    queryKey: ["learning-path", worldId],
    queryFn: async () => {
      const res = await fetch("/api/path/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ worldId }),
      });
      if (!res.ok) throw new Error("Failed to generate learning path");
      return res.json();
    },
  });

  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorState message={error.message} />;
  if (!data || data.path.length === 0) return null;

  const activeIndex = data.path.findIndex(
    (island) => island.status === "in_progress" || island.status === "unlocked",
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Your Learning Path</h2>
          {data.style && (
            <p className="text-sm text-muted-foreground">
              Personalized for: <span className="font-medium text-primary-400">{styleLabels[data.style] ?? data.style}</span>
            </p>
          )}
        </div>
        <div className="flex gap-1.5">
          {data.recommendedContentTypes.map((type) => {
            const Icon = formatIcons[type] ?? BookOpen;
            return (
              <span
                key={type}
                className="flex items-center gap-1 rounded-full bg-primary-500/10 px-2.5 py-1 text-[10px] font-medium text-primary-400"
              >
                <Icon className="h-3 w-3" />
                {formatLabels[type] ?? type}
              </span>
            );
          })}
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-6 top-0 h-full w-0.5 bg-gradient-to-b from-primary-500/40 via-accent-500/40 to-muted" />

        <div className="space-y-6">
          {data.path.map((island, idx) => {
            const isActive = idx === activeIndex;
            const isCompleted = island.status === "completed";
            const isLocked = island.status === "locked";
            const isLast = idx === data.path.length - 1;

            return (
              <motion.div
                key={island.islandId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="relative pl-14"
              >
                <div className="absolute left-4 top-1 z-10">
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                  ) : isLocked ? (
                    <Lock className="h-5 w-5 text-muted-foreground/40" />
                  ) : isActive ? (
                    <motion.div
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Sparkles className="h-5 w-5 text-yellow-400" />
                    </motion.div>
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground/30" />
                  )}
                </div>

                <div
                  className={cn(
                    "rounded-xl border p-4 transition-all duration-300",
                    isActive
                      ? "border-primary-500/40 bg-primary-500/5 shadow-lg shadow-primary-500/5"
                      : isCompleted
                        ? "border-green-500/20 bg-green-500/5"
                        : isLocked
                          ? "border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.01)] opacity-50"
                          : "border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-foreground">{island.islandTitle}</h3>
                      {isCompleted && (
                        <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-[10px] font-medium text-green-400">
                          Mastered
                        </span>
                      )}
                      {isActive && (
                        <span className="rounded-full bg-yellow-500/15 px-2 py-0.5 text-[10px] font-medium text-yellow-400">
                          In Progress
                        </span>
                      )}
                      {isLocked && (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground/60">
                          Locked
                        </span>
                      )}
                    </div>
                    {isActive && !isCompleted && (
                      <Button asChild variant="default" size="sm">
                        <Link href={`/worlds/${worldId}/islands/${island.islandId}`}>
                          Continue <ArrowRight className="ml-1 h-3 w-3" />
                        </Link>
                      </Button>
                    )}
                  </div>

                  {island.concepts.length > 0 && !isLocked && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {island.concepts.map((concept) => {
                        const Icon = formatIcons[concept.format] ?? BookOpen;
                        return (
                          <span
                            key={concept.id}
                            className="inline-flex items-center gap-1 rounded-md bg-[rgba(255,255,255,0.04)] px-2 py-1 text-xs text-muted-foreground"
                          >
                            <Icon className="h-3 w-3" />
                            {concept.title}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {isLocked && (
                    <p className="mt-2 text-xs text-muted-foreground/40">Complete previous islands to unlock</p>
                  )}
                </div>

                {!isLast && (
                  <div className="absolute bottom-0 left-[1.125rem] h-6 w-0.5 bg-gradient-to-b from-transparent to-transparent" />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
