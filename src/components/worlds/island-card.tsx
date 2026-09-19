"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { ScaleOnHover } from "@/components/ui/motion";
import { Lock, CheckCircle, PlayCircle } from "lucide-react";

interface IslandCardProps {
  id: string;
  worldId: string;
  title: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  conceptCount: number;
  progress: { status: string; progress: number };
}

const statusConfig = {
  locked: { icon: Lock, className: "opacity-50", label: "Locked" },
  unlocked: { icon: PlayCircle, className: "", label: "Start" },
  in_progress: { icon: PlayCircle, className: "border-blue-500/30", label: "Continue" },
  completed: { icon: CheckCircle, className: "border-green-500/30", label: "Completed" },
};

export function IslandCard({ id, worldId, title, description, icon, color, conceptCount, progress }: IslandCardProps) {
  const config = statusConfig[progress.status as keyof typeof statusConfig] ?? statusConfig.locked;
  const StatusIcon = config.icon;

  return (
    <ScaleOnHover>
      <Link
        href={progress.status === "locked" ? "#" : `/worlds/${worldId}/islands/${id}`}
        className={cn("block", progress.status === "locked" && "pointer-events-none")}
      >
        <div
          className={cn(
            "glass-card group relative overflow-hidden rounded-xl border p-5 transition-all duration-300",
            "border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.12)]",
            config.className,
          )}
        >
          <div className="flex items-center gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-2xl"
              style={{ backgroundColor: color ? `${color}20` : "rgba(99,102,241,0.1)" }}
            >
              {icon ?? "🏝️"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="truncate text-base font-semibold text-foreground">{title}</h4>
                <StatusIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
              </div>
              {description && (
                <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">{description}</p>
              )}
              <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                <span>{conceptCount} {conceptCount === 1 ? "concept" : "concepts"}</span>
                {progress.progress > 0 && (
                  <>
                    <span className="text-muted-foreground/40">·</span>
                    <span>{Math.round(progress.progress * 100)}%</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {progress.progress > 0 && progress.status !== "completed" && (
            <div className="mt-3">
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${progress.progress * 100}%`,
                    backgroundColor: color ?? "#6366f1",
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </Link>
    </ScaleOnHover>
  );
}