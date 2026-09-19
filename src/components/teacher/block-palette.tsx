"use client";

import { Type, Video, HelpCircle, Image, Code, Minus, FileText, FileCheck } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface BlockPaletteProps {
  onAddBlock: (blockType: string) => void;
}

const blockTypes = [
  { type: "text", label: "Text", icon: Type },
  { type: "video", label: "Video", icon: Video },
  { type: "quiz", label: "Quiz", icon: HelpCircle },
  { type: "assignment", label: "Assignment", icon: FileCheck },
  { type: "pdf", label: "PDF", icon: FileText },
  { type: "image", label: "Image", icon: Image },
  { type: "code", label: "Code", icon: Code },
  { type: "divider", label: "Divider", icon: Minus },
];

export function BlockPalette({ onAddBlock }: BlockPaletteProps) {
  return (
    <Card size="sm">
      <h3 className="mb-3 text-sm font-semibold text-foreground">Add Block</h3>
      <div className="grid grid-cols-2 gap-2">
        {blockTypes.map(({ type, label, icon: Icon }) => (
          <button
            key={type}
            onClick={() => onAddBlock(type)}
            className={cn(
              "flex flex-col items-center gap-1 rounded-lg border border-border p-3 transition-colors hover:border-primary-300 hover:bg-primary-50",
            )}
          >
            <Icon className="h-5 w-5 text-muted-foreground" />
            <span className="text-xs font-medium text-foreground">{label}</span>
          </button>
        ))}
      </div>
    </Card>
  );
}
