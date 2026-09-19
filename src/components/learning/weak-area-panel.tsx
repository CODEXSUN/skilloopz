"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { AlertTriangle, Brain, Clock, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";

interface WeakArea {
  islandId: string;
  islandTitle: string;
  score: number;
  gaps: string[];
  concepts: string[];
}

interface WeaknessReport {
  weakAreas: WeakArea[];
  memoryScore: number;
  attentionSpan: number;
  totalWeak: number;
}

export function WeakAreaPanel() {
  const { data, isLoading, error } = useQuery<WeaknessReport>({
    queryKey: ["weakness-report"],
    queryFn: async () => {
      const res = await fetch("/api/student/weakness-report");
      if (!res.ok) throw new Error("Failed to fetch weakness report");
      return res.json();
    },
  });

  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorState message={error.message} />;
  if (!data || data.weakAreas.length === 0) {
    return (
      <EmptyState icon={Target} title="No weaknesses detected" description="You're doing great! Keep up the good work." />
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-yellow-400" />
              Weak Areas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-2xl font-bold text-foreground">{data.totalWeak}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Brain className="h-4 w-4 text-blue-400" />
              Memory
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-2xl font-bold text-foreground">{Math.round(data.memoryScore * 100)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-purple-400" />
              Attention
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-2xl font-bold text-foreground">{data.attentionSpan}m</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        {data.weakAreas.map((area, idx) => (
          <motion.div
            key={area.islandId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-foreground">{area.islandTitle}</h4>
              <span className={cn(
                "text-sm font-medium",
                area.score < 0.3 ? "text-red-400" : area.score < 0.6 ? "text-yellow-400" : "text-green-400",
              )}>
                {Math.round(area.score * 100)}%
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
              <motion.div
                className={cn(
                  "h-full rounded-full",
                  area.score < 0.3 ? "bg-red-500" : area.score < 0.6 ? "bg-yellow-500" : "bg-green-500",
                )}
                initial={{ width: 0 }}
                animate={{ width: `${area.score * 100}%` }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
            {area.gaps.length > 0 && (
              <p className="mt-2 text-xs text-muted-foreground">
                {area.gaps.length} prerequisite gap{area.gaps.length > 1 ? "s" : ""} detected
              </p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}