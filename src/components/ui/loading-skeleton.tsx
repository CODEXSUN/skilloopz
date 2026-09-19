"use client";

import { motion } from "framer-motion";

interface LoadingSkeletonProps {
  count?: number;
  variant?: "card" | "list" | "stats";
}

export function LoadingSkeleton({ count = 3, variant = "card" }: LoadingSkeletonProps) {
  if (variant === "stats") {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-6" />
        ))}
      </div>
    );
  }

  if (variant === "list") {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-4" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="h-48 animate-pulse rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-5"
        >
          <div className="mb-3 h-32 w-full rounded-xl bg-[rgba(255,255,255,0.04)]" />
          <div className="h-3 w-3/4 rounded bg-[rgba(255,255,255,0.04)]" />
          <div className="mt-2 h-2 w-1/2 rounded bg-[rgba(255,255,255,0.04)]" />
        </motion.div>
      ))}
    </div>
  );
}
