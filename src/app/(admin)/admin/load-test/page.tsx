"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Gauge,
  Loader2,
  RefreshCw,
  Play,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  BarChart3,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";

interface LoadTestResult {
  requestNumber: number;
  statusCode: number | null;
  responseTimeMs: number;
  success: boolean;
  error?: string;
}

interface LoadTestSummary {
  totalRequests: number;
  successful: number;
  failed: number;
  avgResponseTimeMs: number;
  minResponseTimeMs: number;
  maxResponseTimeMs: number;
  p50ResponseTimeMs: number;
  p95ResponseTimeMs: number;
  p99ResponseTimeMs: number;
  requestsPerSecond: number;
  statusCodes: Record<string, number>;
}

interface LoadTestRun {
  id: string;
  status: string;
  targetUrl: string;
  method: string;
  concurrency: number;
  totalRequests: number;
  results: LoadTestResult[];
  summary: LoadTestSummary;
  errorMessage: string | null;
  createdAt: string;
  completedAt: string | null;
}

const DEFAULT_URLS = [
  { label: "Home Page", url: "/api/health" },
  { label: "Courses API", url: "/api/courses" },
  { label: "Blog API", url: "/api/blog" },
];

export default function LoadTestPage() {
  const [runs, setRuns] = useState<LoadTestRun[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [targetUrl, setTargetUrl] = useState("/api/health");
  const [method, setMethod] = useState("GET");
  const [concurrency, setConcurrency] = useState(5);
  const [totalRequests, setTotalRequests] = useState(20);
  const [isRunning, setIsRunning] = useState(false);

  const [selectedRun, setSelectedRun] = useState<LoadTestRun | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  const fetchRuns = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/load-test");
      if (!res.ok) throw new Error("Failed to load tests");
      const data = await res.json();
      setRuns(data.runs);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tests");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRuns();
  }, [fetchRuns]);

  async function handleRunTest() {
    setIsRunning(true);
    setError(null);
    try {
      const fullUrl = targetUrl.startsWith("http") ? targetUrl : `${baseUrl}${targetUrl}`;
      const res = await fetch("/api/admin/load-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUrl: fullUrl, method, concurrency, totalRequests }),
      });
      if (!res.ok) throw new Error("Test failed");
      await fetchRuns();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to run test");
    } finally {
      setIsRunning(false);
    }
  }

  async function openRunDetail(runId: string) {
    setIsLoadingDetail(true);
    try {
      const res = await fetch(`/api/admin/load-test/${runId}`);
      if (!res.ok) throw new Error("Failed to load test details");
      const data = await res.json();
      setSelectedRun(data);
    } catch {
      setError("Failed to load test details");
    } finally {
      setIsLoadingDetail(false);
    }
  }

  if (isLoading) return <LoadingScreen fullScreen={false} message="Loading load tests..." />;

  if (error && runs.length === 0) return <ErrorState message={error} onRetry={fetchRuns} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Load Testing</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Test endpoint performance and measure response times.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchRuns}>
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5 text-primary" />
            Run Load Test
          </CardTitle>
          <CardDescription>
            Configure and run a load test against an endpoint.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {DEFAULT_URLS.map((du) => (
                <Button
                  key={du.label}
                  variant="outline"
                  size="sm"
                  onClick={() => setTargetUrl(du.url)}
                  className={targetUrl === du.url ? "border-primary" : ""}
                >
                  {du.label}
                </Button>
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="sm:col-span-2 space-y-2">
                <label className="text-xs font-medium text-foreground">Target URL</label>
                <Input
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="/api/health or https://..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Method</label>
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Concurrency</label>
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={concurrency}
                  onChange={(e) => setConcurrency(parseInt(e.target.value) || 5)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Total Requests</label>
                <Input
                  type="number"
                  min={1}
                  max={200}
                  value={totalRequests}
                  onChange={(e) => setTotalRequests(parseInt(e.target.value) || 20)}
                />
              </div>
            </div>
            <Button onClick={handleRunTest} disabled={isRunning || !targetUrl}>
              {isRunning ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Play className="mr-1.5 h-3.5 w-3.5" />
              )}
              {isRunning ? "Running..." : "Run Test"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {selectedRun && (
        <div className="space-y-4 rounded-xl border border-border bg-muted/5 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Test Results</h2>
              <p className="text-xs text-muted-foreground">
                {selectedRun.targetUrl} — {selectedRun.method}
                {selectedRun.completedAt && ` — ${Math.round((new Date(selectedRun.completedAt).getTime() - new Date(selectedRun.createdAt).getTime()) / 1000)}s`}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSelectedRun(null)}>
              Back to list
            </Button>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Success</p>
              <p className="mt-0.5 text-2xl font-bold text-emerald-400">{selectedRun.summary.successful}/{selectedRun.summary.totalRequests}</p>
            </div>
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-red-400">Failed</p>
              <p className="mt-0.5 text-2xl font-bold text-red-400">{selectedRun.summary.failed}</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/20 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Avg Response</p>
              <p className="mt-0.5 text-2xl font-bold text-foreground">{selectedRun.summary.avgResponseTimeMs}ms</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/20 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">P95</p>
              <p className="mt-0.5 text-2xl font-bold text-foreground">{selectedRun.summary.p95ResponseTimeMs}ms</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/20 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">P99</p>
              <p className="mt-0.5 text-2xl font-bold text-foreground">{selectedRun.summary.p99ResponseTimeMs}ms</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/20 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">RPS</p>
              <p className="mt-0.5 text-2xl font-bold text-foreground">{selectedRun.summary.requestsPerSecond}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">Status Codes</h3>
              <div className="space-y-1">
                {Object.entries(selectedRun.summary.statusCodes).map(([code, count]) => (
                  <div key={code} className="flex items-center justify-between rounded-md bg-muted/10 px-3 py-1.5 text-sm">
                    <span className="font-mono font-medium text-foreground">{code}</span>
                    <span className="text-muted-foreground">{count}x</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">Timing Summary</h3>
              <div className="space-y-1">
                <div className="flex items-center justify-between rounded-md bg-muted/10 px-3 py-1.5 text-sm">
                  <span className="text-muted-foreground">Min</span>
                  <span className="font-mono text-foreground">{selectedRun.summary.minResponseTimeMs}ms</span>
                </div>
                <div className="flex items-center justify-between rounded-md bg-muted/10 px-3 py-1.5 text-sm">
                  <span className="text-muted-foreground">P50 (Median)</span>
                  <span className="font-mono text-foreground">{selectedRun.summary.p50ResponseTimeMs}ms</span>
                </div>
                <div className="flex items-center justify-between rounded-md bg-muted/10 px-3 py-1.5 text-sm">
                  <span className="text-muted-foreground">P95</span>
                  <span className="font-mono text-foreground">{selectedRun.summary.p95ResponseTimeMs}ms</span>
                </div>
                <div className="flex items-center justify-between rounded-md bg-muted/10 px-3 py-1.5 text-sm">
                  <span className="text-muted-foreground">P99</span>
                  <span className="font-mono text-foreground">{selectedRun.summary.p99ResponseTimeMs}ms</span>
                </div>
                <div className="flex items-center justify-between rounded-md bg-muted/10 px-3 py-1.5 text-sm">
                  <span className="text-muted-foreground">Max</span>
                  <span className="font-mono text-foreground">{selectedRun.summary.maxResponseTimeMs}ms</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">Request Log</h3>
            <div className="max-h-48 overflow-y-auto rounded-lg border border-border bg-muted/10">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">#</th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Status</th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Time</th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Error</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedRun.results.map((r) => (
                    <tr key={r.requestNumber} className="border-b border-border/30">
                      <td className="px-3 py-1.5 font-mono text-muted-foreground">{r.requestNumber}</td>
                      <td className="px-3 py-1.5">
                        <span className={r.success ? "text-emerald-400" : "text-red-400"}>
                          {r.statusCode ?? "ERR"}
                        </span>
                      </td>
                      <td className="px-3 py-1.5 font-mono text-foreground">{r.responseTimeMs}ms</td>
                      <td className="max-w-xs truncate px-3 py-1.5 text-red-400">{r.error ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {!selectedRun && (
        <>
          {runs.length === 0 ? (
            <EmptyState
              icon={Gauge}
              title="No load tests yet"
              description="Run your first load test to measure endpoint performance."
              actionLabel="Run First Test"
              onAction={handleRunTest}
            />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Date</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Target</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Method</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Reqs</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Avg (ms)</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">P95 (ms)</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Success</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {runs.map((run) => (
                    <tr key={run.id} className="border-b border-border/50 transition-colors hover:bg-muted/10">
                      <td className="whitespace-nowrap px-4 py-3 text-[11px] text-muted-foreground">
                        {new Date(run.createdAt).toLocaleString()}
                      </td>
                      <td className="max-w-[200px] truncate px-4 py-3 font-mono text-[11px] text-foreground">
                        {run.targetUrl}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded bg-muted/20 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                          {run.method}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-foreground">{run.totalRequests}</td>
                      <td className="px-4 py-3 font-mono text-xs text-foreground">{run.summary.avgResponseTimeMs}</td>
                      <td className="px-4 py-3 font-mono text-xs text-foreground">{run.summary.p95ResponseTimeMs}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs ${run.summary.successful === run.summary.totalRequests ? "text-emerald-400" : "text-amber-400"}`}>
                          {run.summary.successful}/{run.summary.totalRequests}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => openRunDetail(run.id)}
                          disabled={isLoadingDetail}
                        >
                          {isLoadingDetail ? <Loader2 className="h-3 w-3 animate-spin" /> : "Details"}
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

      {error && runs.length > 0 && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-center text-sm text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}
