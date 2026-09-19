"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Loader2,
  RefreshCw,
  Play,
  AlertTriangle,
  CheckCircle,
  Info,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";

interface SecurityCheckResult {
  id: string;
  name: string;
  description: string;
  status: "pass" | "warning" | "fail" | "info";
  message: string;
  recommendation?: string;
}

interface ScanSummary {
  passed: number;
  failed: number;
  warnings: number;
  total: number;
}

interface SecurityScan {
  id: string;
  status: string;
  results: SecurityCheckResult[];
  summary: ScanSummary;
  triggeredBy: string | null;
  createdAt: string;
  completedAt: string | null;
}

const STATUS_ICONS: Record<string, React.ReactNode> = {
  pass: <CheckCircle className="h-4 w-4 text-emerald-400" />,
  warning: <AlertTriangle className="h-4 w-4 text-amber-400" />,
  fail: <XCircle className="h-4 w-4 text-red-400" />,
  info: <Info className="h-4 w-4 text-blue-400" />,
};

const STATUS_BG: Record<string, string> = {
  pass: "bg-emerald-500/10 border-emerald-500/20",
  warning: "bg-amber-500/10 border-amber-500/20",
  fail: "bg-red-500/10 border-red-500/20",
  info: "bg-blue-500/10 border-blue-500/20",
};

export default function SecurityScanPage() {
  const [scans, setScans] = useState<SecurityScan[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedScan, setSelectedScan] = useState<SecurityScan | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const fetchScans = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/security/scan");
      if (!res.ok) throw new Error("Failed to load scans");
      const data = await res.json();
      setScans(data.scans);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load scans");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScans();
  }, [fetchScans]);

  async function handleRunScan() {
    setIsScanning(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/security/scan", { method: "POST" });
      if (!res.ok) throw new Error("Scan failed");
      await fetchScans();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to run scan");
    } finally {
      setIsScanning(false);
    }
  }

  async function openScanDetail(scanId: string) {
    setIsLoadingDetail(true);
    try {
      const res = await fetch(`/api/admin/security/scan/${scanId}`);
      if (!res.ok) throw new Error("Failed to load scan details");
      const data = await res.json();
      setSelectedScan(data);
    } catch {
      setError("Failed to load scan details");
    } finally {
      setIsLoadingDetail(false);
    }
  }

  if (isLoading) return <LoadingScreen fullScreen={false} message="Loading security scans..." />;

  if (error && scans.length === 0) return <ErrorState message={error} onRetry={fetchScans} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Security Scan</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Run security checks to identify potential vulnerabilities.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchScans}>
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Refresh
          </Button>
          <Button size="sm" onClick={handleRunScan} disabled={isScanning}>
            {isScanning ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Play className="mr-1.5 h-3.5 w-3.5" />
            )}
            Run Scan
          </Button>
        </div>
      </div>

      {selectedScan && (
        <div className="space-y-4 rounded-xl border border-border bg-muted/5 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Scan Results</h2>
              <p className="text-xs text-muted-foreground">
                {new Date(selectedScan.createdAt).toLocaleString()}
                {selectedScan.completedAt && ` — completed in ${Math.round((new Date(selectedScan.completedAt).getTime() - new Date(selectedScan.createdAt).getTime()) / 1000)}s`}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSelectedScan(null)}>
              Back to list
            </Button>
          </div>

          <div className="flex gap-3">
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Passed</p>
              <p className="mt-0.5 text-2xl font-bold text-emerald-400">{selectedScan.summary.passed}</p>
            </div>
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Warnings</p>
              <p className="mt-0.5 text-2xl font-bold text-amber-400">{selectedScan.summary.warnings}</p>
            </div>
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-red-400">Failed</p>
              <p className="mt-0.5 text-2xl font-bold text-red-400">{selectedScan.summary.failed}</p>
            </div>
          </div>

          <div className="space-y-2">
            {selectedScan.results.map((result) => (
              <div
                key={result.id}
                className={`rounded-lg border p-4 ${STATUS_BG[result.status] ?? "bg-muted/30 border-border"}`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {STATUS_ICONS[result.status] ?? <Info className="h-4 w-4 text-muted-foreground" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{result.name}</span>
                      <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase ${
                        result.status === "pass" ? "text-emerald-400" :
                        result.status === "warning" ? "text-amber-400" :
                        result.status === "fail" ? "text-red-400" : "text-blue-400"
                      }`}>
                        {result.status}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{result.description}</p>
                    <p className="mt-1 text-xs text-foreground">{result.message}</p>
                    {result.recommendation && (
                      <p className="mt-1 text-[11px] text-amber-400">
                        Recommendation: {result.recommendation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!selectedScan && (
        <>
          {scans.length === 0 ? (
            <EmptyState
              icon={Shield}
              title="No security scans yet"
              description="Run your first security scan to check the platform's security posture."
              actionLabel="Run First Scan"
              onAction={handleRunScan}
            />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Date</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Passed</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Warnings</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Failed</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {scans.map((scan) => (
                    <tr key={scan.id} className="border-b border-border/50 transition-colors hover:bg-muted/10">
                      <td className="whitespace-nowrap px-4 py-3 text-[11px] text-muted-foreground">
                        {new Date(scan.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          scan.status === "completed" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                        }`}>
                          {scan.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-emerald-400">{scan.summary.passed}</td>
                      <td className="px-4 py-3 text-xs text-amber-400">{scan.summary.warnings}</td>
                      <td className="px-4 py-3 text-xs text-red-400">{scan.summary.failed}</td>
                      <td className="px-4 py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => openScanDetail(scan.id)}
                          disabled={isLoadingDetail}
                        >
                          {isLoadingDetail ? <Loader2 className="h-3 w-3 animate-spin" /> : "View Details"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
