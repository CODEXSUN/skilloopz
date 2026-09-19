"use client";

import { BookOpen, type LucideIcon } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon = BookOpen, title, description, actionLabel, actionHref, onAction }: EmptyStateProps) {
  return (
    <div className="glass-card flex items-center justify-center py-16">
      <div className="flex flex-col items-center gap-4 text-center">
        <Icon className="h-10 w-10 text-muted-foreground/40" />
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {description && <p className="mt-1 text-xs text-muted-foreground/60">{description}</p>}
        </div>
        {actionLabel && actionHref && (
          <Link
            href={actionHref}
            className="group relative inline-flex h-10 items-center gap-2 overflow-hidden rounded-xl bg-foreground px-6 text-sm font-semibold text-background transition-all hover:shadow-glow-sm"
          >
            {actionLabel}
          </Link>
        )}
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="group relative inline-flex h-10 items-center gap-2 overflow-hidden rounded-xl bg-foreground px-6 text-sm font-semibold text-background transition-all hover:shadow-glow-sm"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
