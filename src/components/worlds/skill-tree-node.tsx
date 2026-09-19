"use client";

import { cn } from "@/lib/utils";

interface SkillTreeNodeProps {
  id: string;
  title: string;
  difficulty: number;
  color: string | null;
  isMastered: boolean;
  isInProgress: boolean;
  isLocked: boolean;
  position: { x: number; y: number };
}

export function SkillTreeNode({
  title,
  difficulty,
  color,
  isMastered,
  isInProgress,
  isLocked,
  position,
}: SkillTreeNodeProps) {
  const stateClass = isMastered
    ? "border-green-500 bg-green-500/20 text-green-400"
    : isInProgress
      ? "border-blue-500 bg-blue-500/20 text-blue-400 animate-pulse"
      : isLocked
        ? "border-muted-foreground/20 bg-muted/30 text-muted-foreground/50"
        : "border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] text-foreground";

  return (
    <div
      className={cn(
        "absolute flex items-center justify-center rounded-lg border-2 px-3 py-2 text-xs font-medium transition-all duration-300",
        "hover:z-20 hover:scale-110 hover:shadow-lg",
        stateClass,
      )}
      style={{
        left: position.x,
        top: position.y,
        transform: "translate(-50%, -50%)",
        borderColor: isMastered
          ? undefined
          : isInProgress
            ? undefined
            : color ?? "rgba(255,255,255,0.1)",
      }}
    >
      <span className="whitespace-nowrap">{title}</span>
    </div>
  );
}