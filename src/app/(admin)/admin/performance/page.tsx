"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell,
} from "recharts";
import {
  Activity, Users, BookOpen, Database, Clock, TrendingUp, Shield, FileText,
} from "lucide-react";

import { LoadingScreen } from "@/components/ui/loading-screen";
import { ErrorState } from "@/components/ui/error-state";
import { Badge } from "@/components/ui/badge";

const easing = [0.16, 1, 0.3, 1] as const;

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

interface OverviewData {
  totalUsers: number;
  activeUsersToday: number;
  totalCourses: number;
  totalEnrollments: number;
  totalLessons: number;
  totalAuditLogs: number;
  dbSize: string;
}

interface AuditLogEntry {
  id: string;
  action: string;
  resource: string;
  resourceId: string | null;
  userId: string | null;
  details: string;
  createdAt: string;
}

interface PerformanceData {
  overview: OverviewData;
  activity: {
    recentAuditLogs: AuditLogEntry[];
    auditLogsByAction: { action: string; count: number }[];
    auditLogsByResource: { resource: string; count: number }[];
  };
  distribution: {
    usersByRole: { role: string; count: number }[];
    coursesByStatus: { status: string; count: number }[];
  };
  trends: {
    avgEnrollmentsPerDay: number;
    enrollmentsLastWeek: number;
  };
}

const ACTION_COLORS: Record<string, string> = {
  create: "bg-emerald-500/10 text-emerald-400",
  update: "bg-blue-500/10 text-blue-400",
  delete: "bg-red-500/10 text-red-400",
  publish: "bg-violet-500/10 text-violet-400",
};

export default function PerformancePage() {
  const [data, setData] = useState<PerformanceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/performance");
      if (!res.ok) throw new Error("Failed to load performance data");
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load performance data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) return <LoadingScreen fullScreen={false} message="Loading performance metrics..." />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;
  if (!data) return null;

  const { overview, activity, distribution, trends } = data;

  const statCards = [
    { label: "Total Users", value: overview.totalUsers, icon: Users, color: "text-blue-400", bgColor: "bg-blue-500/10" },
    { label: "Active Today", value: overview.activeUsersToday, icon: Activity, color: "text-emerald-400", bgColor: "bg-emerald-500/10" },
    { label: "Total Courses", value: overview.totalCourses, icon: BookOpen, color: "text-violet-400", bgColor: "bg-violet-500/10" },
    { label: "Enrollments", value: overview.totalEnrollments, icon: TrendingUp, color: "text-amber-400", bgColor: "bg-amber-500/10" },
    { label: "Lessons Completed", value: overview.totalLessons, icon: FileText, color: "text-cyan-400", bgColor: "bg-cyan-500/10" },
    { label: "Audit Log Entries", value: overview.totalAuditLogs, icon: Shield, color: "text-pink-400", bgColor: "bg-pink-500/10" },
    { label: "Database Size", value: overview.dbSize, icon: Database, color: "text-orange-400", bgColor: "bg-orange-500/10" },
    { label: "Avg Enrollments/Day", value: trends.avgEnrollmentsPerDay, icon: Clock, color: "text-green-400", bgColor: "bg-green-500/10" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Performance Monitoring</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          System metrics, activity trends, and resource usage.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
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
                  <p className="font-heading text-xl font-bold text-foreground">
                    {typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}
                  </p>
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
          <h3 className="font-heading text-sm font-bold text-foreground">Audit Logs by Action</h3>
          <p className="text-xs text-muted-foreground">Distribution of actions in the audit log.</p>
          <div className="mt-4 h-48">
            {activity.auditLogsByAction.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activity.auditLogsByAction}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="action" tick={{ fontSize: 10, fill: "#6b7280" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px", fontSize: "12px" }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No audit log data yet.
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: easing, delay: 0.2 }}
          className="rounded-xl border border-border/50 bg-muted/5 p-4"
        >
          <h3 className="font-heading text-sm font-bold text-foreground">Users by Role</h3>
          <p className="text-xs text-muted-foreground">Distribution of users across roles.</p>
          <div className="mt-4 h-48">
            {distribution.usersByRole.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distribution.usersByRole}
                    dataKey="count"
                    nameKey="role"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                  >
                    {distribution.usersByRole.map((_, i) => (
                      <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px", fontSize: "12px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No user data yet.
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: easing, delay: 0.3 }}
        className="rounded-xl border border-border/50 bg-muted/5 p-4"
      >
        <h3 className="font-heading text-sm font-bold text-foreground">Recent Activity</h3>
        <p className="text-xs text-muted-foreground">Latest audit log entries from the past hour.</p>
        <div className="mt-4 space-y-2">
          {activity.recentAuditLogs.length > 0 ? (
            activity.recentAuditLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/5 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${ACTION_COLORS[log.action] ?? "bg-muted/30 text-muted-foreground"}`}>
                    {log.action}
                  </span>
                  <span className="text-xs font-medium text-foreground">{log.resource}</span>
                  {log.resourceId && (
                    <span className="text-[10px] text-muted-foreground font-mono">#{log.resourceId.slice(0, 8)}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <p className="py-4 text-center text-sm text-muted-foreground">No recent activity.</p>
          )}
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: easing, delay: 0.4 }}
          className="rounded-xl border border-border/50 bg-muted/5 p-4"
        >
          <h3 className="font-heading text-sm font-bold text-foreground">Audit Logs by Resource</h3>
          <p className="text-xs text-muted-foreground">Most modified resources in the system.</p>
          <div className="mt-4 space-y-3">
            {activity.auditLogsByResource.length > 0 ? (
              activity.auditLogsByResource.map((item, i) => (
                <div key={item.resource} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    />
                    <span className="text-sm text-foreground">{item.resource}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{item.count} changes</span>
                </div>
              ))
            ) : (
              <p className="py-4 text-center text-sm text-muted-foreground">No resource data yet.</p>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: easing, delay: 0.5 }}
          className="rounded-xl border border-border/50 bg-muted/5 p-4"
        >
          <h3 className="font-heading text-sm font-bold text-foreground">Courses by Status</h3>
          <p className="text-xs text-muted-foreground">Distribution of course states.</p>
          <div className="mt-4 space-y-3">
            {distribution.coursesByStatus.length > 0 ? (
              distribution.coursesByStatus.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={item.status === "published" ? "default" : item.status === "draft" ? "secondary" : "outline"}
                      className="text-xs"
                    >
                      {item.status}
                    </Badge>
                  </div>
                  <span className="text-sm text-foreground">{item.count}</span>
                </div>
              ))
            ) : (
              <p className="py-4 text-center text-sm text-muted-foreground">No course data yet.</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
