"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ThumbsDown, ThumbsUp, Minus, Gauge } from "lucide-react";
import { cn } from "@/lib/utils";
import { getDifficultyLabel, getDifficultyColor } from "@/lib/learning/difficulty-scaler";

interface DifficultyIndicatorProps {
  lessonId: string;
}

export function DifficultyIndicator({ lessonId }: DifficultyIndicatorProps) {
  const [feedback, setFeedback] = useState<"too_easy" | "just_right" | "too_hard" | null>(null);

  const { data: current } = useQuery<{ difficulty: number }>({
    queryKey: ["difficulty-feedback", lessonId],
    queryFn: async () => {
      const res = await fetch("/api/lesson/difficulty-feedback");
      if (!res.ok) throw new Error("Failed to fetch difficulty");
      return res.json();
    },
  });

  const feedbackMutation = useMutation({
    mutationFn: async (rating: "too_easy" | "just_right" | "too_hard") => {
      const res = await fetch("/api/lesson/difficulty-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, difficultyRating: rating }),
      });
      if (!res.ok) throw new Error("Failed to submit feedback");
      return res.json();
    },
    onSuccess: () => {
      setTimeout(() => setFeedback(null), 3000);
    },
  });

  const difficulty = current?.difficulty ?? 2;
  const label = getDifficultyLabel(difficulty);
  const color = getDifficultyColor(difficulty);

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] px-2 py-1">
        <Gauge className={cn("h-3 w-3", color)} />
        <span className={cn("text-xs font-medium", color)}>{label}</span>
      </div>

      <div className="flex items-center gap-0.5 rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-0.5">
        {(["too_easy", "just_right", "too_hard"] as const).map((rating) => {
          const Icon = rating === "too_easy" ? ThumbsUp :
                       rating === "too_hard" ? ThumbsDown : Minus;
          const isActive = feedback === rating;
          return (
            <button
              key={rating}
              onClick={() => {
                setFeedback(rating);
                feedbackMutation.mutate(rating);
              }}
              disabled={feedbackMutation.isPending}
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground/50 transition-all",
                isActive
                  ? rating === "too_easy"
                    ? "bg-green-500/15 text-green-400"
                    : rating === "too_hard"
                      ? "bg-red-500/15 text-red-400"
                      : "bg-blue-500/15 text-blue-400"
                  : "hover:bg-[rgba(255,255,255,0.04)] hover:text-muted-foreground",
              )}
              title={rating === "too_easy" ? "Too Easy" : rating === "too_hard" ? "Too Hard" : "Just Right"}
            >
              <Icon className="h-3 w-3" />
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {feedbackMutation.data && feedback && (
          <motion.span
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="text-[10px] text-muted-foreground"
          >
            {feedbackMutation.data.reason}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
