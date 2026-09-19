"use client";

import { cn } from "@/lib/utils";

interface ProgressBarProps {
  current: number;
  total: number;
  className?: string;
}

export function ProgressBar({ current, total, className }: ProgressBarProps) {
  const progress = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Progress</span>
        <span>{progress}%</span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
