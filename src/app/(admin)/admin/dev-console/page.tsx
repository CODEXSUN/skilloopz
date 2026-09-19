"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Database, Users, BookOpen, GraduationCap, FileText, Image,
  Activity, Server, Clock, AlertTriangle, CheckCircle,
} from "lucide-react";

import { LoadingScreen } from "@/components/ui/loading-screen";
import { ErrorState } from "@/components/ui/error-state";

const easing = [0.16, 1, 0.3, 1] as const;

interface SystemStats {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  totalLessons: number;
  totalMedia: number;
  totalPages: number;
  auditLogCount: number;
  dbSizeBytes: number;
}

interface RecentActivity {
  id: string;
  action: string;
  resource: string;
  userId: string | null;
  createdAt: string;
}

interface HealthInfo {
  database: string;
  uptime: number;
  nodeVersion: string;
  timestamp: string;
}

interface SystemData {
  stats: SystemStats;
  recentActivity: RecentActivity[];
  health: HealthInfo;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatUptime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

export default function DevConsolePage() {
  const [data, setData] = useState<SystemData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/system")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load system data");
        return res.json();
      })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingScreen fullScreen={false} message="Loading system data..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easing }}
      >
        <h1 className="text-2xl font-bold text-foreground">Dev Console</h1>
        <p className="mt-1 text-sm text-muted-foreground">System health, metrics, and activity logs.</p>
      </motion.div>

      {/* Health Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.05, ease: easing }}
        className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-6"
      >
        <h2 className="mb-4 font-heading text-base font-bold text-foreground">System Health</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-xl bg-[rgba(255,255,255,0.03)] p-4">
            <CheckCircle className="h-5 w-5 text-emerald-400" />
            <div>
              <p className="text-xs text-muted-foreground">Database</p>
              <p className="font-medium text-foreground capitalize">{data.health.database}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-[rgba(255,255,255,0.03)] p-4">
            <Clock className="h-5 w-5 text-blue-400" />
            <div>
              <p className="text-xs text-muted-foreground">Uptime</p>
              <p className="font-medium text-foreground">{formatUptime(data.health.uptime)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-[rgba(255,255,255,0.03)] p-4">
            <Server className="h-5 w-5 text-purple-400" />
            <div>
              <p className="text-xs text-muted-foreground">Node.js</p>
              <p className="font-medium text-foreground">{data.health.nodeVersion}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Database Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: easing }}
        className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-6"
      >
        <h2 className="mb-4 font-heading text-base font-bold text-foreground">Database Stats</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl bg-[rgba(255,255,255,0.03)] p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Users className="h-3 w-3 text-blue-400" /> Users
            </div>
            <p className="mt-1 font-heading text-xl font-bold text-foreground">{data.stats.totalUsers.toLocaleString()}</p>
          </div>
          <div className="rounded-xl bg-[rgba(255,255,255,0.03)] p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <BookOpen className="h-3 w-3 text-green-400" /> Courses
            </div>
            <p className="mt-1 font-heading text-xl font-bold text-foreground">{data.stats.totalCourses.toLocaleString()}</p>
          </div>
          <div className="rounded-xl bg-[rgba(255,255,255,0.03)] p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <GraduationCap className="h-3 w-3 text-yellow-400" /> Enrollments
            </div>
            <p className="mt-1 font-heading text-xl font-bold text-foreground">{data.stats.totalEnrollments.toLocaleString()}</p>
          </div>
          <div className="rounded-xl bg-[rgba(255,255,255,0.03)] p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <FileText className="h-3 w-3 text-purple-400" /> Lessons
            </div>
            <p className="mt-1 font-heading text-xl font-bold text-foreground">{data.stats.totalLessons.toLocaleString()}</p>
          </div>
          <div className="rounded-xl bg-[rgba(255,255,255,0.03)] p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Image className="h-3 w-3 text-pink-400" /> Media
            </div>
            <p className="mt-1 font-heading text-xl font-bold text-foreground">{data.stats.totalMedia.toLocaleString()}</p>
          </div>
          <div className="rounded-xl bg-[rgba(255,255,255,0.03)] p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Database className="h-3 w-3 text-cyan-400" /> DB Size
            </div>
            <p className="mt-1 font-heading text-xl font-bold text-foreground">{formatSize(data.stats.dbSizeBytes)}</p>
          </div>
          <div className="rounded-xl bg-[rgba(255,255,255,0.03)] p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Activity className="h-3 w-3 text-orange-400" /> Audit Logs
            </div>
            <p className="mt-1 font-heading text-xl font-bold text-foreground">{data.stats.auditLogCount.toLocaleString()}</p>
          </div>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: easing }}
        className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-6"
      >
        <h2 className="mb-4 font-heading text-base font-bold text-foreground">Recent Activity</h2>
        {data.recentActivity.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent activity</p>
        ) : (
          <div className="space-y-2">
            {data.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between rounded-lg bg-[rgba(255,255,255,0.03)] p-3">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{activity.action} {activity.resource}</p>
                    <p className="text-xs text-muted-foreground">User: {activity.userId ?? "system"}</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(activity.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
