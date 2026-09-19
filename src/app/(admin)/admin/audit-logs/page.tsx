"use client";

import { useState, useEffect, useCallback } from "react";
import { Shield, Loader2, RefreshCw, Filter } from "lucide-react";

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

interface AuditLogEntry {
  id: string;
  action: string;
  resource: string;
  resourceId: string | null;
  userId: string | null;
  details: string;
  createdAt: string;
}

const ACTION_LABELS: Record<string, string> = {
  create: "Create",
  update: "Update",
  delete: "Delete",
  publish: "Publish",
  restore: "Restore",
  permission_change: "Permission Change",
  theme_change: "Theme Change",
};

const ACTION_COLORS: Record<string, string> = {
  create: "bg-emerald-500/10 text-emerald-400",
  update: "bg-blue-500/10 text-blue-400",
  delete: "bg-red-500/10 text-red-400",
  publish: "bg-violet-500/10 text-violet-400",
  restore: "bg-amber-500/10 text-amber-400",
  permission_change: "bg-orange-500/10 text-orange-400",
  theme_change: "bg-pink-500/10 text-pink-400",
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [resourceFilter, setResourceFilter] = useState<string>("all");

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (actionFilter !== "all") params.set("action", actionFilter);
      if (resourceFilter !== "all") params.set("resource", resourceFilter);
      params.set("limit", "100");

      const res = await fetch(`/api/admin/audit-logs?${params}`);
      if (!res.ok) throw new Error("Failed to load audit logs");
      const data = await res.json();
      setLogs(data.logs);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load audit logs");
    } finally {
      setIsLoading(false);
    }
  }, [actionFilter, resourceFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const parseDetails = (details: string): Record<string, unknown> => {
    try {
      return JSON.parse(details);
    } catch {
      return {};
    }
  };

  if (isLoading) return <LoadingScreen fullScreen={false} message="Loading audit logs..." />;

  if (error) return <ErrorState message={error} onRetry={fetchLogs} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Audit Logs</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track all changes made across the platform ({total} entries).
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchLogs}>
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Filters:</span>
        </div>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="h-8 w-36">
            <SelectValue placeholder="All Actions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            {Object.entries(ACTION_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={resourceFilter} onValueChange={setResourceFilter}>
          <SelectTrigger className="h-8 w-36">
            <SelectValue placeholder="All Resources" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Resources</SelectItem>
            <SelectItem value="page">Page</SelectItem>
            <SelectItem value="role">Role</SelectItem>
            <SelectItem value="theme">Theme</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="section">Section</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {logs.length === 0 ? (
        <EmptyState
          icon={Shield}
          title="No audit logs yet"
          description="Actions will appear here as you make changes."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Action</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Resource</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Details</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-border/50 transition-colors hover:bg-muted/10">
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${ACTION_COLORS[log.action] ?? "bg-muted/30 text-muted-foreground"}`}>
                      {ACTION_LABELS[log.action] ?? log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium text-foreground">{log.resource}</span>
                    {log.resourceId && (
                      <span className="ml-1.5 text-[10px] text-muted-foreground font-mono">#{log.resourceId.slice(0, 8)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(parseDetails(log.details)).length > 0 ? (
                        Object.entries(parseDetails(log.details)).map(([key, val]) => (
                          <span key={key} className="inline-flex items-center rounded-md bg-muted/20 px-1.5 py-0.5 text-[10px] text-muted-foreground font-mono">
                            {key}: {String(val).slice(0, 30)}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-muted-foreground">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[11px] text-muted-foreground whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
