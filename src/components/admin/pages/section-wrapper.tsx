"use client";

import { GripVertical, Trash2, ChevronUp, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { usePageBuilderStore, type SectionType } from "@/stores/pageBuilderStore";

const sectionLabels: Record<SectionType, string> = {
  hero: "Hero",
  "feature-grid": "Feature Grid",
  "course-carousel": "Course Carousel",
  "stats-bar": "Stats Bar",
  testimonials: "Testimonials",
  "cta-banner": "CTA Banner",
  faq: "FAQ",
  "pricing-table": "Pricing Table",
  "custom-html": "Custom HTML",
};

interface SectionWrapperProps {
  sectionId: string;
  blockType: SectionType;
  isFirst: boolean;
  isLast: boolean;
  children: React.ReactNode;
}

export function SectionWrapper({
  sectionId,
  blockType,
  isFirst,
  isLast,
  children,
}: SectionWrapperProps) {
  const { selectedId, selectSection, removeSection, sections, reorderSections } =
    usePageBuilderStore();
  const isSelected = selectedId === sectionId;

  function handleMoveUp() {
    const idx = sections.findIndex((s) => s.id === sectionId);
    if (idx <= 0) return;
    const next = [...sections];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    reorderSections(next.map((s, i) => ({ ...s, sortOrder: i })));
  }

  function handleMoveDown() {
    const idx = sections.findIndex((s) => s.id === sectionId);
    if (idx < 0 || idx >= sections.length - 1) return;
    const next = [...sections];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    reorderSections(next.map((s, i) => ({ ...s, sortOrder: i })));
  }

  return (
    <div
      className={cn(
        "group relative rounded-lg border-2 transition-colors",
        isSelected
          ? "border-primary-500 bg-primary-500/10"
          : "border-border hover:border-muted-foreground/30",
      )}
      onClick={() => selectSection(sectionId)}
    >
      <div className="flex items-center justify-between border-b border-inherit bg-muted/50 px-3 py-1.5">
        <div className="flex items-center gap-2">
          <div className="cursor-grab text-muted-foreground active:cursor-grabbing">
            <GripVertical className="h-4 w-4" />
          </div>
          <span className="text-xs font-medium text-foreground">
            {sectionLabels[blockType] ?? blockType}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            disabled={isFirst}
            onClick={(e) => {
              e.stopPropagation();
              handleMoveUp();
            }}
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            disabled={isLast}
            onClick={(e) => {
              e.stopPropagation();
              handleMoveDown();
            }}
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-red-500 hover:text-red-600"
            onClick={(e) => {
              e.stopPropagation();
              removeSection(sectionId);
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
