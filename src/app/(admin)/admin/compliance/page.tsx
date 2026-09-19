"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ClipboardCheck,
  Loader2,
  RefreshCw,
  Play,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Info,
  Scale,
  ShieldCheck,
  UserCheck,
  Database,
  Globe,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

interface ComplianceCheckResult {
  id: string;
  name: string;
  category: "gdpr" | "coppa" | "data_protection" | "platform";
  description: string;
  status: "pass" | "warning" | "fail" | "info";
  message: string;
  regulation: string;
  recommendation?: string;
}

interface ComplianceSummary {
  passed: number;
  failed: number;
  warnings: number;
  total: number;
}

interface ComplianceReport {
  id: string;
  status: string;
  category: string;
  results: ComplianceCheckResult[];
  summary: ComplianceSummary;
  createdAt: string;
  completedAt: string | null;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  gdpr: <Scale className="h-4 w-4" />,
  coppa: <UserCheck className="h-4 w-4" />,
  data_protection: <Database className="h-4 w-4" />,
  platform: <Globe className="h-4 w-4" />,
};

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

const CATEGORY_COLORS: Record<string, string> = {
  gdpr: "bg-purple-500/10 text-purple-400",
  coppa: "bg-cyan-500/10 text-cyan-400",
  data_protection: "bg-blue-500/10 text-blue-400",
  platform: "bg-gray-500/10 text-gray-400",
};

export default function CompliancePage() {
  const [reports, setReports] = useState<ComplianceReport[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [category, setCategory] = useState("all");
  const [selectedReport, setSelectedReport] = useState<ComplianceReport | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/compliance");
      if (!res.ok) throw new Error("Failed to load reports");
      const data = await res.json();
      setReports(data.reports);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reports");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  async function handleRunReport() {
    setIsRunning(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/compliance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category }),
      });
      if (!res.ok) throw new Error("Report failed");
      await fetchReports();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to run report");
    } finally {
      setIsRunning(false);
    }
  }

  async function openReportDetail(reportId: string) {
    setIsLoadingDetail(true);
    try {
      const res = await fetch(`/api/admin/compliance/${reportId}`);
      if (!res.ok) throw new Error("Failed to load report");
      const data = await res.json();
      setSelectedReport(data);
    } catch {
      setError("Failed to load report details");
    } finally {
      setIsLoadingDetail(false);
    }
  }

  if (isLoading) return <LoadingScreen fullScreen={false} message="Loading compliance reports..." />;

  if (error && reports.length === 0) return <ErrorState message={error} onRetry={fetchReports} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Compliance Reporting</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Assess regulatory compliance with GDPR, COPPA, and data protection standards.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchReports}>
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Refresh
          </Button>
          <Button size="sm" onClick={handleRunReport} disabled={isRunning}>
            {isRunning ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Play className="mr-1.5 h-3.5 w-3.5" />
            )}
            Run Report
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-xs text-muted-foreground">Category:</label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="h-8 w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="gdpr">GDPR</SelectItem>
            <SelectItem value="coppa">COPPA</SelectItem>
            <SelectItem value="data_protection">Data Protection</SelectItem>
            <SelectItem value="platform">Platform</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {selectedReport && (
        <div className="space-y-4 rounded-xl border border-border bg-muted/5 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Compliance Report</h2>
              <p className="text-xs text-muted-foreground">
                {new Date(selectedReport.createdAt).toLocaleString()}
                {selectedReport.category !== "all" && ` — Category: ${selectedReport.category}`}
                {selectedReport.completedAt && ` — ${Math.round((new Date(selectedReport.completedAt).getTime() - new Date(selectedReport.createdAt).getTime()) / 1000)}s`}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSelectedReport(null)}>
              Back to list
            </Button>
          </div>

          <div className="flex gap-3">
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Passed</p>
              <p className="mt-0.5 text-2xl font-bold text-emerald-400">{selectedReport.summary.passed}</p>
            </div>
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Warnings</p>
              <p className="mt-0.5 text-2xl font-bold text-amber-400">{selectedReport.summary.warnings}</p>
            </div>
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-red-400">Failed</p>
              <p className="mt-0.5 text-2xl font-bold text-red-400">{selectedReport.summary.failed}</p>
            </div>
          </div>

          <div className="space-y-2">
            {selectedReport.results.map((result) => (
              <div
                key={result.id}
                className={`rounded-lg border p-4 ${STATUS_BG[result.status] ?? "bg-muted/30 border-border"}`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {STATUS_ICONS[result.status]}
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
                      <span className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${CATEGORY_COLORS[result.category] ?? ""}`}>
                        {CATEGORY_ICONS[result.category]}
                        {result.category.toUpperCase()}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{result.description}</p>
                    <p className="mt-1 text-xs text-foreground">{result.message}</p>
                    <div className="mt-1 flex gap-2">
                      <span className="text-[10px] text-muted-foreground">{result.regulation}</span>
                    </div>
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

      {!selectedReport && (
        <>
          {reports.length === 0 ? (
            <EmptyState
              icon={ClipboardCheck}
              title="No compliance reports yet"
              description="Run your first compliance report to assess regulatory alignment."
              actionLabel="Run First Report"
              onAction={handleRunReport}
            />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Date</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Category</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Passed</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Warnings</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Failed</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report.id} className="border-b border-border/50 transition-colors hover:bg-muted/10">
                      <td className="whitespace-nowrap px-4 py-3 text-[11px] text-muted-foreground">
                        {new Date(report.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${CATEGORY_COLORS[report.category === "all" ? "platform" : (report.category as keyof typeof CATEGORY_COLORS)] ?? ""}`}>
                          {report.category.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-emerald-400">{report.summary.passed}</td>
                      <td className="px-4 py-3 text-xs text-amber-400">{report.summary.warnings}</td>
                      <td className="px-4 py-3 text-xs text-red-400">{report.summary.failed}</td>
                      <td className="px-4 py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => openReportDetail(report.id)}
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
