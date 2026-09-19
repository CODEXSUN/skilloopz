"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { FadeIn, ScaleOnHover } from "@/components/ui/motion";

interface WorldCardProps {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  islandCount: number;
  progress: { completed: number; total: number } | null;
}

export function WorldCard({ id, title, description, icon, color, islandCount, progress }: WorldCardProps) {
  const completed = progress?.completed ?? 0;
  const total = progress?.total ?? 0;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <ScaleOnHover>
      <Link href={`/worlds/${id}`} className="block">
        <div
          className={cn(
            "glass-card group relative overflow-hidden rounded-xl p-6 transition-all duration-300",
            "border border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.12)]",
            "bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.04)]",
          )}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-xl text-3xl"
                style={{ backgroundColor: color ? `${color}20` : "rgba(59,130,246,0.1)" }}
              >
                {icon ?? "🌍"}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                {description && (
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{description}</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
            <span>{islandCount} {islandCount === 1 ? "island" : "islands"}</span>
            {total > 0 && (
              <>
                <span className="text-muted-foreground/40">·</span>
                <span>{completed}/{total} completed</span>
              </>
            )}
          </div>

          {total > 0 && (
            <div className="mt-3">
              <div className="flex items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: color ?? "#3b82f6" }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
                <span className="text-xs font-medium" style={{ color: color ?? "#3b82f6" }}>
                  {pct}%
                </span>
              </div>
            </div>
          )}

          {pct === 100 && (
            <div className="absolute right-4 top-4 rounded-full bg-green-500/20 px-2.5 py-0.5 text-xs font-medium text-green-400">
              Mastered
            </div>
          )}
        </div>
      </Link>
    </ScaleOnHover>
  );
}