"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

interface ErrorStateProps {
  title?: string;
  message?: string;
  retry?: boolean;
  onRetry?: () => void;
}

export function ErrorState({ title = "Something went wrong", message = "An unexpected error occurred. Please try again.", retry = true, onRetry }: ErrorStateProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[rgba(255,255,255,0.08)] bg-red-500/10">
        <AlertTriangle className="h-6 w-6 text-red-400" />
      </div>
      <h3 className="mt-4 font-heading text-lg font-bold text-foreground">{title}</h3>
      <p className="mt-1 max-w-md text-center text-sm text-muted-foreground">{message}</p>
      {retry && (
        <button
          onClick={onRetry ?? (() => router.refresh())}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-foreground/10 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-foreground/20"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      )}
    </div>
  );
}
