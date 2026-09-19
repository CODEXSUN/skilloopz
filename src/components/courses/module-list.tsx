"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, FileText } from "lucide-react";

import { cn } from "@/lib/utils";

interface Module {
  id: string;
  title: string;
  description: string | null;
  sortOrder: number;
  lessons: {
    id: string;
    title: string;
    sortOrder: number;
    estimatedMinutes: number | null;
  }[];
}

interface ModuleListProps {
  modules: Module[];
}

export function ModuleList({ modules }: ModuleListProps) {
  const [expanded, setExpanded] = useState<string | null>(modules[0]?.id ?? null);

  return (
    <div className="space-y-2">
      {modules.map((mod) => (
        <div
          key={mod.id}
          className="overflow-hidden rounded-lg border border-border"
        >
          <button
            onClick={() => setExpanded(expanded === mod.id ? null : mod.id)}
            className="flex w-full items-center justify-between bg-muted px-4 py-3 text-left hover:bg-muted"
          >
            <div>
              <span className="text-xs font-medium text-tertiary-foreground">
                Module {mod.sortOrder}
              </span>
              <h3 className="font-medium text-foreground">{mod.title}</h3>
            </div>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-tertiary-foreground transition-transform",
                expanded === mod.id && "rotate-180",
              )}
            />
          </button>

          {expanded === mod.id && (
            <div className="divide-y divide-border border-t border-border">
              {mod.lessons.map((lesson) => (
                <Link
                  key={lesson.id}
                  href={`/lessons/${lesson.id}`}
                  className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted"
                >
                  <FileText className="h-4 w-4 shrink-0 text-tertiary-foreground" />
                  <span className="flex-1 text-foreground">{lesson.title}</span>
                  {lesson.estimatedMinutes && (
                    <span className="text-xs text-tertiary-foreground">
                      {lesson.estimatedMinutes} min
                    </span>
                  )}
                </Link>
              ))}
              {mod.lessons.length === 0 && (
                <p className="px-4 py-3 text-sm text-tertiary-foreground">
                  No lessons yet
                </p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
