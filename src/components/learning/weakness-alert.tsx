"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { AlertTriangle, X, ArrowRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RebuildData {
  suggestions: { priority: string }[];
  totalGaps: number;
  criticalCount: number;
}

export function WeaknessAlert() {
  const [dismissed, setDismissed] = useState(false);
  const { data } = useQuery<RebuildData>({
    queryKey: ["foundation-rebuild"],
    queryFn: async () => {
      const res = await fetch("/api/student/foundation-rebuild");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    refetchInterval: 60000,
  });

  if (dismissed || !data || data.criticalCount === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, height: 0 }}
        animate={{ opacity: 1, y: 0, height: "auto" }}
        exit={{ opacity: 0, y: -20, height: 0 }}
        className="relative overflow-hidden rounded-2xl border border-red-500/20 bg-gradient-to-r from-red-500/10 via-red-500/5 to-transparent p-4"
      >
        <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-red-500/10 blur-[60px]" />
        <div className="relative z-10 flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/15">
            <AlertTriangle className="h-5 w-5 text-red-400" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">Foundation Gaps Detected</h3>
              <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-medium text-red-400">
                {data.criticalCount} critical
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {data.totalGaps} prerequisite {data.totalGaps === 1 ? "concept needs" : "concepts need"} reinforcement.
              Strengthening your foundations will unlock new content and improve retention.
            </p>
            <div className="mt-3 flex gap-2">
              <Button asChild variant="default" size="sm">
                <Link href="#foundation-rebuilder">
                  <Shield className="mr-1 h-3 w-3" />
                  Review Gaps
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground/50 transition-colors hover:bg-red-500/15 hover:text-red-400"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
