"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Loader2, TrendingUp, BookOpen, Zap, Calendar, ChevronDown,
  Trophy, Clock, Target,
} from "lucide-react";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const easing = [0.16, 1, 0.3, 1] as const;

interface ChildItem {
  id: string;
  fullName: string | null;
  email: string | null;
}

interface WeeklyXpPoint {
  date: string;
  xp: number;
}

interface CourseProgress {
  id: string;
  title: string;
  subject: string | null;
  difficulty: string;
  progress: number;
  completedLessons: number;
  completed: boolean;
}

interface ActivityItem {
  id: string;
  lessonTitle: string;
  status: string;
  score: number | null;
  timestamp: string;
}

interface ReportData {
  child: {
    id: string;
    fullName: string | null;
    email: string | null;
    xp: number;
    level: number;
    currentStreak: number;
    longestStreak: number;
    lastActivityDate: string | null;
  };
  weeklyXp: WeeklyXpPoint[];
  courses: CourseProgress[];
  totalCompletedLessons: number;
  recentActivity: ActivityItem[];
}

interface Props {
  childItems: ChildItem[];
}

export function ParentReportsContent({ childItems }: Props) {
  const [selectedChildId, setSelectedChildId] = useState(childItems[0]?.id ?? "");
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedChildId) return;
    fetch(`/api/parent/reports?childId=${selectedChildId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json) setData(json as ReportData);
      })
      .catch(() => {});
  }, [selectedChildId]);

  if (childItems.length === 0) {
    return (
      <div className="mx-auto max-w-5xl space-y-8">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Reports</h1>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BookOpen className="h-10 w-10 text-muted-foreground/40" />
          <p className="mt-4 text-sm font-medium text-muted-foreground">No children linked to your account</p>
        </div>
      </div>
    );
  }

  const selectedChild = childItems.find((c) => c.id === selectedChildId);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easing }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Reports</h1>
          <p className="mt-1 text-muted-foreground">Detailed learning progress for each child.</p>
        </div>

        <div className="w-56">
          <Label htmlFor="child" className="sr-only">Select child</Label>
          <Select value={selectedChildId} onValueChange={setSelectedChildId}>
            <SelectTrigger id="child">
              <SelectValue placeholder="Select child..." />
            </SelectTrigger>
            <SelectContent>
              {childItems.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.fullName ?? c.email ?? "Child"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary-400" />
        </div>
      ) : data ? (
        <>
          {/* Child Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05, ease: easing }}
            className="grid grid-cols-2 gap-4 sm:grid-cols-4"
          >
            <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Zap className="h-4 w-4 text-primary-400" /> XP
              </div>
              <p className="mt-1 font-heading text-2xl font-bold text-foreground">{data.child.xp.toLocaleString()}</p>
            </div>
            <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4 text-accent-400" /> Level
              </div>
              <p className="mt-1 font-heading text-2xl font-bold text-foreground">{data.child.level}</p>
            </div>
            <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Trophy className="h-4 w-4 text-yellow-400" /> Streak
              </div>
              <p className="mt-1 font-heading text-2xl font-bold text-foreground">{data.child.currentStreak}d</p>
            </div>
            <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BookOpen className="h-4 w-4 text-green-400" /> Lessons
              </div>
              <p className="mt-1 font-heading text-2xl font-bold text-foreground">{data.totalCompletedLessons}</p>
            </div>
          </motion.div>

          {/* Weekly XP Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: easing }}
            className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-6"
          >
            <h2 className="mb-4 font-heading text-base font-bold text-foreground">Weekly XP</h2>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.weeklyXp}>
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }}
                    tickFormatter={(v: string) => {
                      const d = new Date(v);
                      return d.toLocaleDateString("en-US", { weekday: "short" });
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(0,0,0,0.8)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="xp" radius={[4, 4, 0, 0]} fill="rgba(79,124,255,0.7)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Course Progress */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: easing }}
              className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-6"
            >
              <h2 className="mb-4 font-heading text-base font-bold text-foreground">Course Progress</h2>
              {data.courses.length === 0 ? (
                <p className="text-sm text-muted-foreground">No courses enrolled yet.</p>
              ) : (
                <div className="space-y-3">
                  {data.courses.map((course) => (
                    <div key={course.id}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground truncate max-w-[200px]">{course.title}</span>
                        <span className="text-muted-foreground">{Math.round(course.progress)}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
                        <div
                          className="h-full rounded-full bg-primary-500 transition-all duration-500"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                      {course.completed && (
                        <p className="mt-0.5 text-xs text-green-400">Completed ✓</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: easing }}
              className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-6"
            >
              <h2 className="mb-4 font-heading text-base font-bold text-foreground">Recent Activity</h2>
              {data.recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent activity.</p>
              ) : (
                <div className="space-y-3">
                  {data.recentActivity.slice(0, 10).map((act) => (
                    <div key={act.id} className="flex items-start gap-3 text-sm">
                      <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary-500/10">
                        {act.status === "completed" ? (
                          <BookOpen className="h-3 w-3 text-primary-400" />
                        ) : (
                          <Clock className="h-3 w-3 text-yellow-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-foreground">{act.lessonTitle}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(act.timestamp).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {act.score !== null && (
                            <span className="ml-2 text-primary-400">
                              Score: {Math.round(act.score)}%
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </>
      ) : null}
    </div>
  );
}
