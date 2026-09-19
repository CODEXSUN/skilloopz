"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Activity, Server, Database, Clock, AlertTriangle, CheckCircle, XCircle,
  RefreshCw, Cpu, HardDrive, MemoryStick, Zap,
} from "lucide-react";

import { LoadingScreen } from "@/components/ui/loading-screen";
import { ErrorState } from "@/components/ui/error-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const easing = [0.16, 1, 0.3, 1] as const;

interface HealthCheck {
  name: string;
  status: "ok" | "healthy" | "warning" | "unhealthy" | "critical";
  detail: string;
}

interface SystemData {
  uptime: string;
  platform: string;
  arch: string;
  nodeVersion: string;
  cpuCount: number;
  cpuModel: string;
  memory: {
    total: number;
    free: number;
    used: number;
    usagePercent: number;
  };
  disk: {
    total: string;
    used: string;
    free: string;
    usagePercent: number;
  };
}

interface HealthData {
  overall: "healthy" | "degraded" | "critical";
  responseTime: number;
  system: SystemData;
  database: {
    status: string;
    size: string;
    tables: Record<string, number>;
  };
  checks: HealthCheck[];
  recentErrors: Array<{
    id: string;
    action: string;
    resource: string;
    details: string;
    createdAt: string;
  }>;
}

const STATUS_COLORS: Record<string, string> = {
  healthy: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  ok: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  warning: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  unhealthy: "bg-red-500/20 text-red-400 border-red-500/30",
  critical: "bg-red-500/20 text-red-400 border-red-500/30",
};

const STATUS_ICONS: Record<string, typeof CheckCircle> = {
  healthy: CheckCircle,
  ok: CheckCircle,
  warning: AlertTriangle,
  unhealthy: XCircle,
  critical: XCircle,
};

export default function SystemHealthPage() {
  const [data, setData] = useState<HealthData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/system-health");
      if (!res.ok) throw new Error("Failed to load system health data");
      const json = await res.json();
      setData(json);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load system health data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) return <LoadingScreen fullScreen={false} message="Loading system health..." />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;
  if (!data) return null;

  const overallColor = data.overall === "healthy"
    ? "text-emerald-400"
    : data.overall === "degraded"
      ? "text-amber-400"
      : "text-red-400";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">System Health</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Real-time system diagnostics and health checks.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-muted-foreground">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: easing }}
        className="flex items-center gap-4 rounded-xl border border-border/50 bg-muted/5 p-6"
      >
        <div className={`flex h-14 w-14 items-center justify-center rounded-full ${
          data.overall === "healthy" ? "bg-emerald-500/20" : data.overall === "degraded" ? "bg-amber-500/20" : "bg-red-500/20"
        }`}>
          <Activity className={`h-7 w-7 ${overallColor}`} />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Overall Status</p>
          <p className={`font-heading text-2xl font-bold ${overallColor}`}>
            {data.overall.charAt(0).toUpperCase() + data.overall.slice(1)}
          </p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-sm text-muted-foreground">Response Time</p>
          <p className="font-heading text-2xl font-bold text-foreground">{data.responseTime}ms</p>
        </div>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Uptime", value: data.system.uptime, icon: Clock, color: "text-blue-400", bgColor: "bg-blue-500/10" },
          { label: "CPU Cores", value: `${data.system.cpuCount}`, icon: Cpu, color: "text-violet-400", bgColor: "bg-violet-500/10" },
          { label: "Memory Usage", value: `${data.system.memory.usagePercent}%`, icon: MemoryStick, color: "text-amber-400", bgColor: "bg-amber-500/10" },
          { label: "DB Size", value: data.database.size, icon: Database, color: "text-emerald-400", bgColor: "bg-emerald-500/10" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: easing }}
              className="rounded-xl border border-border/50 bg-muted/5 p-4"
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="font-heading text-xl font-bold text-foreground">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: easing, delay: 0.1 }}
          className="rounded-xl border border-border/50 bg-muted/5 p-4"
        >
          <h3 className="font-heading text-sm font-bold text-foreground">Health Checks</h3>
          <p className="text-xs text-muted-foreground">System component status.</p>
          <div className="mt-4 space-y-3">
            {data.checks.map((check) => {
              const StatusIcon = STATUS_ICONS[check.status] ?? CheckCircle;
              return (
                <div key={check.name} className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/5 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <StatusIcon className={`h-4 w-4 ${
                      check.status === "ok" || check.status === "healthy"
                        ? "text-emerald-400"
                        : check.status === "warning"
                          ? "text-amber-400"
                          : "text-red-400"
                    }`} />
                    <span className="text-sm text-foreground">{check.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{check.detail}</span>
                    <Badge className={`text-[10px] ${STATUS_COLORS[check.status] ?? "bg-muted text-muted-foreground"}`}>
                      {check.status}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: easing, delay: 0.2 }}
          className="rounded-xl border border-border/50 bg-muted/5 p-4"
        >
          <h3 className="font-heading text-sm font-bold text-foreground">System Info</h3>
          <p className="text-xs text-muted-foreground">Server environment details.</p>
          <div className="mt-4 space-y-3">
            {[
              { label: "Platform", value: data.system.platform },
              { label: "Architecture", value: data.system.arch },
              { label: "Node.js", value: data.system.nodeVersion },
              { label: "CPU", value: data.system.cpuModel.slice(0, 50) },
              { label: "Memory Total", value: formatBytes(data.system.memory.total) },
              { label: "Memory Free", value: formatBytes(data.system.memory.free) },
              { label: "Disk Used", value: data.system.disk.used },
              { label: "Disk Free", value: data.system.disk.free },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{item.label}</span>
                <span className="text-xs font-mono text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: easing, delay: 0.3 }}
        className="rounded-xl border border-border/50 bg-muted/5 p-4"
      >
        <h3 className="font-heading text-sm font-bold text-foreground">Database Tables</h3>
        <p className="text-xs text-muted-foreground">Record counts across all tables.</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(data.database.tables).map(([table, count]) => (
            <div key={table} className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/5 px-4 py-3">
              <span className="text-xs font-medium text-foreground">{table}</span>
              <span className="text-sm font-bold text-foreground">{count.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {data.recentErrors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: easing, delay: 0.4 }}
          className="rounded-xl border border-red-500/30 bg-red-500/5 p-4"
        >
          <h3 className="font-heading text-sm font-bold text-red-400">Recent Errors</h3>
          <p className="text-xs text-muted-foreground">Errors detected in the last 24 hours.</p>
          <div className="mt-4 space-y-2">
            {data.recentErrors.map((err) => (
              <div key={err.id} className="flex items-center justify-between rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  <div>
                    <span className="text-xs font-medium text-foreground">{err.resource}</span>
                    <span className="ml-2 text-[10px] text-muted-foreground font-mono">{err.action}</span>
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {new Date(err.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}
