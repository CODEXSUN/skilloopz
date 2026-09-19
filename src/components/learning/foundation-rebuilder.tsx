"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Link from "next/link";
import { AlertTriangle, BookOpen, RefreshCw, Shield, Swords } from "lucide-react";
import { cn } from "@/lib/utils";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

interface MissingPrerequisite {
  conceptId: string;
  conceptTitle: string;
  difficulty: number;
  isMastered: boolean;
  score: number;
}

interface WeakConcept {
  conceptId: string;
  conceptTitle: string;
  difficulty: number;
  masteryScore: number;
  missingPrerequisites: MissingPrerequisite[];
}

interface RebuildSuggestion {
  islandId: string;
  islandTitle: string;
  worldTitle: string | null;
  weakConcepts: WeakConcept[];
  priority: "critical" | "moderate" | "low";
  reason: string;
}

interface RebuildData {
  suggestions: RebuildSuggestion[];
  totalGaps: number;
  criticalCount: number;
}

export function FoundationRebuilder() {
  const { data, isLoading, error, refetch } = useQuery<RebuildData>({
    queryKey: ["foundation-rebuild"],
    queryFn: async () => {
      const res = await fetch("/api/student/foundation-rebuild");
      if (!res.ok) throw new Error("Failed to fetch foundation rebuild data");
      return res.json();
    },
  });

  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorState message={error.message} />;
  if (!data || data.suggestions.length === 0) {
    return (
      <EmptyState
        icon={Shield}
        title="Strong Foundation"
        description="No foundation gaps detected. Your prerequisite knowledge is solid!"
      />
    );
  }

  const priorityColors: Record<string, string> = {
    critical: "text-red-400",
    moderate: "text-yellow-400",
    low: "text-blue-400",
  };

  const priorityBg: Record<string, string> = {
    critical: "bg-red-500/10 border-red-500/20",
    moderate: "bg-yellow-500/10 border-yellow-500/20",
    low: "bg-blue-500/10 border-blue-500/20",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Swords className="h-5 w-5 text-orange-400" />
          <h3 className="font-semibold text-foreground">Foundation Rebuilder</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={() => refetch()}>
          <RefreshCw className="mr-1 h-3 w-3" />
          Refresh
        </Button>
      </div>

      {data.criticalCount > 0 && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3">
          <p className="flex items-center gap-2 text-sm font-medium text-red-400">
            <AlertTriangle className="h-4 w-4" />
            {data.criticalCount} critical {data.criticalCount === 1 ? "area needs" : "areas need"} immediate attention
          </p>
        </div>
      )}

      <div className="grid gap-3">
        {data.suggestions.map((suggestion, idx) => (
          <motion.div
            key={suggestion.islandId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            className={cn(
              "rounded-xl border p-4",
              priorityBg[suggestion.priority] ?? "border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]",
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-foreground">{suggestion.islandTitle}</h4>
                  {suggestion.worldTitle && (
                    <span className="text-xs text-muted-foreground">in {suggestion.worldTitle}</span>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{suggestion.reason}</p>
              </div>
              <span className={cn("shrink-0 text-xs font-medium", priorityColors[suggestion.priority])}>
                {suggestion.priority}
              </span>
            </div>

            {suggestion.weakConcepts.length > 0 && (
              <div className="mt-3 space-y-2">
                {suggestion.weakConcepts.map((wc) => (
                  <div key={wc.conceptId} className="rounded-lg bg-[rgba(0,0,0,0.2)] p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{wc.conceptTitle}</span>
                      <span className={cn(
                        "text-xs",
                        wc.masteryScore < 0.3 ? "text-red-400" : wc.masteryScore < 0.6 ? "text-yellow-400" : "text-green-400",
                      )}>
                        {Math.round(wc.masteryScore * 100)}%
                      </span>
                    </div>
                    {wc.missingPrerequisites.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <p className="text-xs text-muted-foreground">Missing prerequisites:</p>
                        {wc.missingPrerequisites.map((pre) => (
                          <div key={pre.conceptId} className="flex items-center justify-between rounded-md bg-[rgba(0,0,0,0.2)] px-2 py-1">
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-foreground">{pre.conceptTitle}</span>
                            </div>
                            <span className={cn(
                              "text-xs",
                              pre.score < 0.3 ? "text-red-400" : pre.score < 0.6 ? "text-yellow-400" : "text-green-400",
                            )}>
                              {Math.round(pre.score * 100)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-3 flex gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href={`/worlds`}>
                  <BookOpen className="mr-1 h-3 w-3" />
                  Review in Worlds
                </Link>
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
