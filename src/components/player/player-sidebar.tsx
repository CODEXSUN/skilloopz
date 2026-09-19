"use client";

import { cn } from "@/lib/utils";

interface PlayerSidebarProps {
  blocks: { id: string; type: string }[];
  currentIndex: number;
  completedBlocks: Record<number, { completed: boolean }>;
  onNavigate: (index: number) => void;
}

const blockIcons: Record<string, string> = {
  text: "T",
  video: "▶",
  quiz: "?",
  flashcard: "F",
  image: "🖼",
};

export function PlayerSidebar({
  blocks,
  currentIndex,
  completedBlocks,
  onNavigate,
}: PlayerSidebarProps) {
  return (
    <aside className="hidden w-64 border-r bg-muted p-4 lg:block">
      <h3 className="mb-3 text-sm font-medium text-muted-foreground">Lesson Content</h3>
      <div className="space-y-1">
        {blocks.map((block, index) => {
          const isActive = index === currentIndex;
          const isCompleted = completedBlocks[index]?.completed;

          return (
            <button
              key={block.id}
              onClick={() => onNavigate(index)}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors",
                isActive
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded text-xs">
                {isCompleted ? (
                  <span className="text-emerald-500">✓</span>
                ) : (
                  <span className="text-tertiary-foreground">
                    {blockIcons[block.type] ?? "•"}
                  </span>
                )}
              </span>
              <span className="truncate">
                {block.type.charAt(0).toUpperCase() + block.type.slice(1)}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
