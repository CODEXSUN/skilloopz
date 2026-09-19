"use client";

import { useSearchParams } from "next/navigation";
import { CheckCircle } from "lucide-react";

export function VerifiedBanner() {
  const searchParams = useSearchParams();
  const verified = searchParams.get("verified");

  if (!verified) return null;

  return (
    <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
      <CheckCircle className="h-4 w-4 shrink-0" />
      <span>Email verified successfully! Please sign in.</span>
    </div>
  );
}
