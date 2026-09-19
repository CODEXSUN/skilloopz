"use client";

import { useState, useEffect, useCallback } from "react";
import { Bug, Loader2, RefreshCw, Filter, CheckCircle, XCircle, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ErrorLogEntry {
  id: string;
  message: string;
  stack: string | null;
  level: string;
  source: string;
  url: string | null;
  method: string | null;
  statusCode: number | null;
  userId: string | null;
  userAgent: string | null;
  metadata: string;
  resolved: boolean;
  createdAt: string;
}

const LEVEL_COLORS: Record<string, string> = {
  error: "bg-red-500/10 text-red-400",
  warning: "bg-amber-500/10 text-amber-400",
  info: "bg-blue-500/10 text-blue-400",
};

const LEVEL_LABELS: Record<string, string> = {
  error: "Error",
  warning: "Warning",
  info: "Info",
};

export default function ErrorLogsPage() {
  const [logs, setLogs] = useState<ErrorLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [warningCount, setWarningCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [resolvedFilter, setResolvedFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (levelFilter !== "all") params.set("level", levelFilter);
      if (sourceFilter !== "all") params.set("source", sourceFilter);
      if (resolvedFilter !== "all") params.set("resolved", resolvedFilter);
      params.set("limit", "100");

      const res = await fetch(`/api/admin/error-logs?${params}`);
      if (!res.ok) throw new Error("Failed to load error logs");
      const data = await res.json();
      setLogs(data.logs);
      setTotal(data.total);
      setErrorCount(data.errorCount);
      setWarningCount(data.warningCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load error logs");
    } finally {
      setIsLoading(false);
    }
  }, [levelFilter, sourceFilter, resolvedFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  async function handleResolve(id: string, resolved: boolean) {
    try {
      const res = await fetch(`/api/admin/error-logs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolved }),
      });
      if (!res.ok) throw new Error("Failed to update");
      setLogs((prev) =>
        prev.map((l) => (l.id === id ? { ...l, resolved } : l))
      );
    } catch {
      fetchLogs();
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/admin/error-logs/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      setLogs((prev) => prev.filter((l) => l.id !== id));
      setTotal((t) => t - 1);
    } catch {
      fetchLogs();
    }
  }

  const parseMetadata = (metadata: string): Record<string, unknown> => {
    try {
      return JSON.parse(metadata);
    } catch {
      return {};
    }
  };

  if (isLoading) return <LoadingScreen fullScreen={false} message="Loading error logs..." />;

  if (error) return <ErrorState message={error} onRetry={fetchLogs} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Error Logs</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track and manage errors across the platform.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchLogs}>
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="rounded-lg border border-border bg-muted/20 px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total</p>
          <p className="mt-0.5 text-2xl font-bold text-foreground">{total}</p>
        </div>
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-red-400">Errors</p>
          <p className="mt-0.5 text-2xl font-bold text-red-400">{errorCount}</p>
        </div>
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Warnings</p>
          <p className="mt-0.5 text-2xl font-bold text-amber-400">{warningCount}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Filters:</span>
        </div>
        <Select value={levelFilter} onValueChange={setLevelFilter}>
          <SelectTrigger className="h-8 w-32">
            <SelectValue placeholder="All Levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="error">Error</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="info">Info</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="h-8 w-32">
            <SelectValue placeholder="All Sources" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="frontend">Frontend</SelectItem>
            <SelectItem value="api">API</SelectItem>
            <SelectItem value="server">Server</SelectItem>
          </SelectContent>
        </Select>
        <Select value={resolvedFilter} onValueChange={setResolvedFilter}>
          <SelectTrigger className="h-8 w-32">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="false">Unresolved</SelectItem>
            <SelectItem value="true">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {logs.length === 0 ? (
        <EmptyState
          icon={Bug}
          title="No error logs found"
          description="Errors will appear here as they occur across the platform."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Level</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Message</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Source</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Date</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <>
                  <tr
                    key={log.id}
                    className="border-b border-border/50 transition-colors hover:bg-muted/10 cursor-pointer"
                    onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                  >
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${LEVEL_COLORS[log.level] ?? "bg-muted/30 text-muted-foreground"}`}>
                        {LEVEL_LABELS[log.level] ?? log.level}
                      </span>
                    </td>
                    <td className="max-w-xs truncate px-4 py-3 font-mono text-[12px] text-foreground">
                      {log.message}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{log.source}</td>
                    <td className="px-4 py-3">
                      {log.resolved ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400">
                          <CheckCircle className="h-3 w-3" /> Resolved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-amber-400">
                          <XCircle className="h-3 w-3" /> Open
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-[11px] text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          title={log.resolved ? "Mark unresolved" : "Mark resolved"}
                          onClick={(e) => { e.stopPropagation(); handleResolve(log.id, !log.resolved); }}
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-400 hover:text-red-300"
                          title="Delete"
                          onClick={(e) => { e.stopPropagation(); handleDelete(log.id); }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                  {expandedId === log.id && (
                    <tr key={`${log.id}-details`}>
                      <td colSpan={6} className="bg-muted/5 px-6 py-4">
                        <div className="space-y-3">
                          {log.url && (
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">URL</span>
                              <p className="mt-0.5 font-mono text-xs text-foreground">{log.url}</p>
                            </div>
                          )}
                          {log.method && log.statusCode && (
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Request</span>
                              <p className="mt-0.5 font-mono text-xs text-foreground">{log.method} {log.statusCode}</p>
                            </div>
                          )}
                          {log.userId && (
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">User ID</span>
                              <p className="mt-0.5 font-mono text-xs text-foreground">{log.userId}</p>
                            </div>
                          )}
                          {log.stack && (
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Stack Trace</span>
                              <pre className="mt-1 max-h-40 overflow-auto rounded-lg bg-muted/20 p-3 font-mono text-[11px] text-muted-foreground">
                                {log.stack}
                              </pre>
                            </div>
                          )}
                          {log.metadata && log.metadata !== "{}" && (
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Metadata</span>
                              <pre className="mt-1 max-h-32 overflow-auto rounded-lg bg-muted/20 p-3 font-mono text-[11px] text-muted-foreground">
                                {JSON.stringify(parseMetadata(log.metadata), null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
