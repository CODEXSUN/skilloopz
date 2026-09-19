"use client";

import { useState, useMemo } from "react";
import { Loader2, CheckCircle, AlertTriangle, XCircle, Rocket } from "lucide-react";
import { useDevModeStore } from "@/stores/devModeStore";
import { usePageBuilderStore } from "@/stores/pageBuilderStore";
import { useHistoryStore } from "@/stores/historyStore";
import { validatePublish, type ValidationResult } from "@/lib/page-validator";

interface PublishButtonProps {
  onPublish?: () => Promise<void>;
  isDirty?: boolean;
  pageTitle?: string;
}

export function PublishButton({ onPublish, isDirty = false, pageTitle = "" }: PublishButtonProps) {
  const [publishing, setPublishing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const enabled = useDevModeStore((s) => s.enabled);

  const validationResults = useMemo<ValidationResult[]>(() => {
    if (!showConfirm) return [];
    const sections = usePageBuilderStore.getState().sections;
    return validatePublish({ title: pageTitle }, sections);
  }, [showConfirm, pageTitle]);

  const errors = validationResults.filter((r) => r.type === "error");
  const warnings = validationResults.filter((r) => r.type === "warning");
  const hasErrors = errors.length > 0;

  if (!enabled) return null;

  async function handlePublish() {
    setPublishing(true);
    try {
      const sections = usePageBuilderStore.getState().sections;
      useHistoryStore.getState().saveSnapshot("Before publish", JSON.stringify(sections));
      await onPublish?.();
    } finally {
      setPublishing(false);
      setShowConfirm(false);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowConfirm(true)}
        disabled={publishing || !isDirty}
        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
          isDirty
            ? "bg-primary-500 text-white hover:bg-primary-600 shadow-glow-sm"
            : "bg-[rgba(255,255,255,0.04)] text-muted-foreground cursor-not-allowed"
        }`}
      >
        {publishing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Rocket className="h-4 w-4" />
        )}
        {publishing ? "Publishing..." : "Publish"}
      </button>

      {showConfirm && (
        <>
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={() => setShowConfirm(false)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2">
            <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(11,13,16,0.98)] p-6 shadow-xl backdrop-blur-xl">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500/10">
                  <Rocket className="h-5 w-5 text-primary-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Publish Changes</h3>
                  <p className="text-xs text-muted-foreground">This will update the live site.</p>
                </div>
              </div>

              <div className="mb-4 space-y-2">
                {hasErrors ? (
                  errors.map((r, i) => (
                    <div key={i} className="flex items-start gap-2 rounded-lg bg-red-500/5 px-3 py-2">
                      <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400" />
                      <span className="text-xs text-red-400">{r.message}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center gap-2 rounded-lg bg-emerald-500/5 px-3 py-2">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-xs text-emerald-400">All checks passed</span>
                  </div>
                )}

                {warnings.map((r, i) => (
                  <div key={i} className="flex items-start gap-2 rounded-lg bg-amber-500/5 px-3 py-2">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
                    <span className="text-xs text-amber-400">{r.message}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="rounded-xl px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePublish}
                  disabled={publishing || hasErrors}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-5 py-2 text-xs font-semibold text-white hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {publishing ? "Publishing..." : "Publish Now"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
