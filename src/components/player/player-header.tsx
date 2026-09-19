"use client";

import { Clock, CheckCircle2 } from "lucide-react";

interface PlayerHeaderProps {
  title: string;
  estimatedMinutes: number | null;
  currentBlock: number;
  totalBlocks: number;
  isCompleted: boolean;
}

export function PlayerHeader({
  title,
  estimatedMinutes,
  currentBlock,
  totalBlocks,
  isCompleted,
}: PlayerHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b bg-white px-6 py-4">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        {isCompleted && (
          <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
            <CheckCircle2 className="h-3 w-3" />
            Completed
          </span>
        )}
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        {estimatedMinutes && (
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {estimatedMinutes} min
          </span>
        )}
        <span>
          {currentBlock} of {totalBlocks}
        </span>
      </div>
    </div>
  );
}
