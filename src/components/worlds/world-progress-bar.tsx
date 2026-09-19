"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface WorldProgressBarProps {
  islands: { id: string; title: string; status: string; color?: string | null }[];
}

export function WorldProgressBar({ islands }: WorldProgressBarProps) {
  const activeIndex = islands.findIndex((i) => i.status === "in_progress" || i.status === "unlocked");
  const currentIndex = activeIndex >= 0 ? activeIndex : islands.filter((i) => i.status === "completed").length - 1;

  return (
    <div className="relative">
      <div className="absolute left-6 right-6 top-5 h-0.5 bg-muted">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex + 1) / islands.length) * 100}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      <div className="relative flex justify-between">
        {islands.map((island, idx) => {
          const isCompleted = island.status === "completed";
          const isActive = island.status === "in_progress" || island.status === "unlocked";
          const isLocked = island.status === "locked";

          return (
            <div key={island.id} className="flex flex-col items-center">
              <motion.div
                className={cn(
                  "relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors",
                  isCompleted && "border-green-500 bg-green-500/20 text-green-400",
                  isActive && "border-blue-500 bg-blue-500/20 text-blue-400",
                  isLocked && "border-muted-foreground/30 bg-muted/50 text-muted-foreground/50",
                )}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: idx * 0.05, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                {isCompleted ? "✓" : idx + 1}
              </motion.div>
              <span
                className={cn(
                  "mt-2 text-xs",
                  isCompleted && "text-green-400",
                  isActive && "text-blue-400",
                  isLocked && "text-muted-foreground/50",
                )}
              >
                {island.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}