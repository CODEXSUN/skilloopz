"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell,
} from "recharts";
import { Zap, BookOpen, CheckCircle, Clock, Target, BarChart3 } from "lucide-react";

import { useStudentAnalytics } from "@/hooks/analytics/useStudentAnalytics";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { ErrorState } from "@/components/ui/error-state";

const PIE_COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#6366f1", "#ec4899"];

function statCard(label: string, value: number | string, icon: typeof Zap, color: string) {
  const Icon = icon;
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-bold text-foreground">{value}</p>
        </div>
      </div>
    </div>
  );
}

function formatMinutes(minutes: number): string {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs > 0) return `${hrs}h ${mins}m`;
  return `${mins}m`;
}

export function AnalyticsContent() {
  const { data, isLoading, error, refetch } = useStudentAnalytics();

  if (isLoading) return <LoadingScreen message="Loading your analytics..." />;
  if (error) return <ErrorState message="Failed to load analytics" onRetry={() => refetch()} />;
  if (!data) return null;

  const { overview, dailyXpTrend, weeklyActivity, scoreDistribution, xpBreakdown, dailyTimeSpent, courses } = data;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCard("Total XP", overview.totalXp.toLocaleString(), Zap, "bg-yellow-500")}
        {statCard("Completed Lessons", overview.completedLessons, CheckCircle, "bg-emerald-500")}
        {statCard("Time Spent", formatMinutes(overview.totalTimeSpent), Clock, "bg-blue-500")}
        {statCard("Average Score", `${overview.avgScore}%`, Target, "bg-violet-500")}
        {statCard("Level", overview.level, BarChart3, "bg-orange-500")}
        {statCard("Streak", `${overview.streak} days`, BookOpen, "bg-red-500")}
        {statCard("Enrolled Courses", overview.enrolledCourses, BookOpen, "bg-cyan-500")}
        {statCard("Avg Quiz Score", overview.avgQuizScore !== null ? `${overview.avgQuizScore}%` : "N/A", Target, "bg-indigo-500")}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Daily XP (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={dailyXpTrend}>
              <defs>
                <linearGradient id="xpGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="amount" stroke="#3b82f6" fill="url(#xpGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Weekly Activity (12 Weeks)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="week" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} name="Completed" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Score Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={scoreDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="range" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Lessons" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold text-foreground">XP Breakdown by Source</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={xpBreakdown} dataKey="amount" nameKey="reason" cx="50%" cy="50%" outerRadius={80} label={(({ reason, percent }: Record<string, unknown>) => `${String(reason)} (${(Number(percent) * 100).toFixed(0)}%)`) as never} labelLine>
                {xpBreakdown.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Time Spent (Last 28 Days)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={dailyTimeSpent}>
              <defs>
                <linearGradient id="timeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" label={{ value: "minutes", angle: -90, position: "insideLeft", style: { fontSize: 10 } }} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="minutes" stroke="#10b981" fill="url(#timeGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Weekly Learning Time</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="week" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" label={{ value: "min", angle: -90, position: "insideLeft", style: { fontSize: 10 } }} />
              <Tooltip contentStyle={{ fontSize: 12 }} formatter={((value: number | string) => formatMinutes(Number(value))) as never} />
              <Bar dataKey="timeSpent" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Time" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {courses.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Course Progress</h3>
          <div className="space-y-3">
            {courses.map((course) => (
              <div key={course.id} className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{course.title}</p>
                  {course.subject && <p className="text-xs text-muted-foreground">{course.subject}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-32 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${course.progress}%` }} />
                  </div>
                  <span className="w-10 text-right text-xs text-muted-foreground">{course.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
