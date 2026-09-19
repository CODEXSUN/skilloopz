"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  Trophy,
  Flame,
  Award,
  Target,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  BarChart3,
} from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const easing = [0.16, 1, 0.3, 1] as const;

interface ChildProfile {
  id: string;
  fullName: string | null;
  email: string | null;
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  avatarUrl: string | null;
  lastActivityDate: string | null;
}

interface CourseItem {
  id: string;
  title: string;
  subject: string | null;
  difficulty: string;
  progress: number;
  completedLessons: number;
  completed: boolean;
  timeSpent: number;
  avgQuizScore: number | null;
}

interface AchievementItem {
  id: string;
  name: string;
  description: string;
  iconUrl: string | null;
  xpReward: number;
  earnedAt: string;
}

interface ActivityItem {
  id: string;
  lessonTitle: string;
  status: string;
  score: number | null;
  timestamp: string;
}

interface WeakSubject {
  subject: string;
  avgScore: number;
  quizCount: number;
}

interface OnTrackStatus {
  isOnTrack: boolean;
  lessonsPerDay: number;
  expectedRate: number;
  streakHealthy: boolean;
}

interface ReportData {
  child: ChildProfile;
  weeklyXp: { date: string; xp: number }[];
  courses: CourseItem[];
  totalCompletedLessons: number;
  totalTimeSpent: number;
  recentActivity: ActivityItem[];
  weakSubjects: WeakSubject[];
  onTrack: OnTrackStatus;
}

interface Props {
  child: ChildProfile;
  enrollments: { id: string; courseId: string; courseTitle: string; progress: number; completed: boolean }[];
  completedLessonsCount: number;
  achievements: AchievementItem[];
}

export function ChildDetailClient({ child, enrollments, completedLessonsCount, achievements }: Props) {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (activeTab !== "reports") return;
    if (reportData !== null) return;

    setLoading(true);
    fetch(`/api/parent/reports?childId=${child.id}&days=30`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setReportData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [activeTab, child.id, reportData]);

  const initials = (child.fullName ?? child.email ?? "C")
    .split(" ")
    .map((s) => s[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  function formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easing }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/parent">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
              {child.fullName ?? child.email ?? "Child"}
            </h1>
            <p className="text-sm text-muted-foreground">{child.email}</p>
          </div>
        </div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="reports">Reports & Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easing }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Child Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Avatar size="lg">
                    {child.avatarUrl ? (
                      <AvatarImage src={child.avatarUrl} alt={child.fullName ?? ""} />
                    ) : null}
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-heading text-xl font-bold text-foreground">
                      {child.fullName ?? "Child"}
                    </p>
                    <p className="text-sm text-muted-foreground">{child.email}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant="secondary">Level {child.level}</Badge>
                      <Badge variant="secondary">{child.xp.toLocaleString()} XP</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05, ease: easing }}
            className="grid grid-cols-2 gap-4 sm:grid-cols-4"
          >
            <div className="relative overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-5 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500/10 text-primary-400">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Courses</p>
                  <p className="font-heading text-xl font-bold text-foreground">
                    {enrollments.length}
                  </p>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-5 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-500/10 text-accent-400">
                  <Trophy className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Lessons</p>
                  <p className="font-heading text-xl font-bold text-foreground">
                    {completedLessonsCount}
                  </p>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-5 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-400">
                  <Flame className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Streak</p>
                  <p className="font-heading text-xl font-bold text-foreground">
                    {child.currentStreak}d
                  </p>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-5 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10 text-green-400">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Longest</p>
                  <p className="font-heading text-xl font-bold text-foreground">
                    {child.longestStreak}d
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {child.lastActivityDate && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: easing }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Last Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground">
                    {new Date(child.lastActivityDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="courses" className="mt-6 space-y-4">
          {enrollments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <BookOpen className="h-10 w-10 text-muted-foreground/40" />
              <p className="mt-4 text-sm font-medium text-muted-foreground">
                No courses enrolled
              </p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: easing }}
              className="space-y-4"
            >
              {enrollments.map((enr, i) => (
                <motion.div
                  key={enr.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05, ease: easing }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{enr.courseTitle}</span>
                        {enr.completed ? (
                          <Badge>Completed</Badge>
                        ) : (
                          <Badge variant="secondary">In Progress</Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="text-muted-foreground">
                          {Math.round(enr.progress)}%
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
                        <div
                          className="h-full rounded-full bg-primary-500 transition-all duration-500"
                          style={{ width: `${enr.progress}%` }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="achievements" className="mt-6">
          {achievements.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Award className="h-10 w-10 text-muted-foreground/40" />
              <p className="mt-4 text-sm font-medium text-muted-foreground">
                No achievements earned yet
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {achievements.map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.05, ease: easing }}
                  className="group relative overflow-hidden rounded-2xl border border-primary-500/20 bg-primary-500/5 p-5 shadow-xl transition-all duration-500 hover:border-primary-500/30 hover:shadow-primary-500/10"
                >
                  <div className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-primary-500/10 blur-[50px]" />
                  <div className="relative z-10 flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-500/20 text-primary-400">
                      <Award className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{a.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {a.description}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-primary-400">
                          +{a.xpReward} XP
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(a.earnedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reports" className="mt-6 space-y-6">
          {loading && (
            <div className="flex items-center justify-center py-16">
              <Clock className="h-6 w-6 animate-spin text-primary-400" />
            </div>
          )}

          {reportData && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: easing }}
              >
                <Card className={reportData.onTrack.isOnTrack ? "border-emerald-500/20" : "border-amber-500/20"}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {reportData.onTrack.isOnTrack ? (
                        <CheckCircle className="h-5 w-5 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-amber-400" />
                      )}
                      Learning Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="rounded-xl bg-[rgba(255,255,255,0.03)] p-4">
                        <p className="text-xs text-muted-foreground">Lessons per day</p>
                        <p className="font-heading text-2xl font-bold text-foreground">
                          {reportData.onTrack.lessonsPerDay}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Target: {reportData.onTrack.expectedRate}/day
                        </p>
                      </div>
                      <div className="rounded-xl bg-[rgba(255,255,255,0.03)] p-4">
                        <p className="text-xs text-muted-foreground">Total time</p>
                        <p className="font-heading text-2xl font-bold text-foreground">
                          {formatTime(reportData.totalTimeSpent)}
                        </p>
                      </div>
                      <div className="rounded-xl bg-[rgba(255,255,255,0.03)] p-4">
                        <p className="text-xs text-muted-foreground">Status</p>
                        <p className={`font-heading text-lg font-bold ${reportData.onTrack.isOnTrack ? "text-emerald-400" : "text-amber-400"}`}>
                          {reportData.onTrack.isOnTrack ? "On Track" : "Needs Attention"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {reportData.onTrack.streakHealthy ? "Streak healthy" : "Streak low"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {reportData.weakSubjects.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1, ease: easing }}
                >
                  <Card className="border-red-500/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-red-400">
                        <AlertTriangle className="h-5 w-5" />
                        Weak Subjects
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {reportData.weakSubjects.map((ws, i) => (
                          <div key={ws.subject} className="flex items-center justify-between rounded-xl bg-[rgba(255,255,255,0.03)] p-4">
                            <div>
                              <p className="font-medium text-foreground">{ws.subject}</p>
                              <p className="text-xs text-muted-foreground">{ws.quizCount} quizzes</p>
                            </div>
                            <div className="text-right">
                              <p className={`font-heading text-xl font-bold ${ws.avgScore < 50 ? "text-red-400" : "text-amber-400"}`}>
                                {Math.round(ws.avgScore)}%
                              </p>
                              <p className="text-xs text-muted-foreground">Average score</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2, ease: easing }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Weekly XP Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end gap-2 h-32">
                      {reportData.weeklyXp.map((day, i) => {
                        const maxXp = Math.max(...reportData.weeklyXp.map((d) => d.xp), 1);
                        const height = (day.xp / maxXp) * 100;
                        return (
                          <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
                            <div
                              className="w-full rounded-t bg-primary-500/60 transition-all duration-300"
                              style={{ height: `${Math.max(height, 4)}%` }}
                            />
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(day.date).toLocaleDateString("en-US", { weekday: "short" })}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3, ease: easing }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Course Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {reportData.courses.map((course, i) => (
                        <div key={course.id} className="rounded-xl bg-[rgba(255,255,255,0.03)] p-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium text-foreground">{course.title}</p>
                            <Badge variant={course.completed ? "default" : "secondary"}>
                              {Math.round(course.progress)}%
                            </Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-xs">
                            <div>
                              <p className="text-muted-foreground">Lessons</p>
                              <p className="font-medium text-foreground">{course.completedLessons}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Time</p>
                              <p className="font-medium text-foreground">{formatTime(course.timeSpent)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Quiz Avg</p>
                              <p className="font-medium text-foreground">
                                {course.avgQuizScore !== null ? `${Math.round(course.avgQuizScore)}%` : "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </>
          )}

          {!loading && !reportData && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <BarChart3 className="h-10 w-10 text-muted-foreground/40" />
              <p className="mt-4 text-sm font-medium text-muted-foreground">
                Load reports to see detailed insights
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setLoading(true);
                  fetch(`/api/parent/reports?childId=${child.id}&days=30`)
                    .then((res) => (res.ok ? res.json() : null))
                    .then((data) => {
                      if (data) setReportData(data);
                      setLoading(false);
                    })
                    .catch(() => setLoading(false));
                }}
              >
                Load Reports
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
