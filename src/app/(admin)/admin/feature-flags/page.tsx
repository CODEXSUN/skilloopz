"use client";

import { useState, useEffect, useCallback } from "react";
import { Flag, Loader2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";

interface FeatureFlag {
  id: string;
  key: string;
  label: string;
  description: string | null;
  enabled: boolean;
  updatedAt: string;
}

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  const fetchFlags = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/feature-flags");
      if (!res.ok) throw new Error("Failed to load feature flags");
      setFlags(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFlags();
  }, [fetchFlags]);

  async function handleToggle(flag: FeatureFlag) {
    setToggling(flag.id);
    try {
      const res = await fetch("/api/admin/feature-flags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: flag.key, enabled: !flag.enabled }),
      });
      if (!res.ok) throw new Error("Failed to toggle");
      setFlags((prev) => prev.map((f) => (f.id === flag.id ? { ...f, enabled: !f.enabled } : f)));
    } catch {
      alert("Failed to toggle flag");
    } finally {
      setToggling(null);
    }
  }

  if (isLoading) return <LoadingScreen fullScreen={false} message="Loading feature flags..." />;

  if (error) return <ErrorState message={error} onRetry={fetchFlags} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Feature Flags</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enable or disable platform features without deploying code.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchFlags}>
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      {flags.length === 0 ? (
        <EmptyState
          icon={Flag}
          title="No feature flags"
          description="Flags will appear here once configured."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Flag</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Description</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Key</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {flags.map((flag) => (
                <tr key={flag.id} className="border-b border-border/50 transition-colors hover:bg-muted/10">
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-foreground">{flag.label}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {flag.description ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <code className="rounded bg-muted/30 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                      {flag.key}
                    </code>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggle(flag)}
                      disabled={toggling === flag.id}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:ring-offset-1 focus:ring-offset-background ${
                        flag.enabled ? "bg-primary-500" : "bg-muted/40"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                          flag.enabled ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-[11px] text-muted-foreground">
                    {new Date(flag.updatedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="border-t border-border bg-muted/10 px-4 py-2">
            <p className="text-[10px] text-muted-foreground/60">
              Changes take effect immediately. No deployment or restart required.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
