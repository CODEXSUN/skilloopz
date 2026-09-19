"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, CheckCircle, Zap, TrendingUp, ArrowRight, Clock, Archive, X, Timer, Target, Calendar, Activity } from "lucide-react";
import Link from "next/link";
import { LevelProgress } from "@/components/gamification/level-progress";
import { StreakFlame } from "@/components/gamification/streak-flame";
import { SeasonalEventsContent } from "@/components/dashboard/seasonal-events-content";
import { StreakNotificationsWidget } from "@/components/gamification/streak-notifications-widget";
import { SpacedRepetitionWidget } from "@/components/gamification/spaced-repetition-widget";
import { FoundationRebuilder } from "@/components/learning/foundation-rebuilder";
import { WeaknessAlert } from "@/components/learning/weakness-alert";

const easing = [0.16, 1, 0.3, 1] as const;

interface EnrollmentCourse {
  id: string;
  progress: number;
  course: {
    id: string;
    title: string;
    description: string | null;
    thumbnailUrl: string | null;
    difficulty: string;
    estimatedMinutes: number | null;
    category: { name: string } | null;
  };
}

interface ContinueLesson {
  id: string;
  title: string;
  courseId: string;
  courseTitle: string;
  estimatedMinutes: number | null;
}

interface RecommendedCourse {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  difficulty: string;
  category: { name: string } | null;
  teacher: { fullName: string | null } | null;
}

interface ActiveEvent {
  id: string;
  name: string;
  description: string;
  icon: string;
  multiplier: number;
  xpBonus: number;
  challenge: { type: string; target: number; label: string };
  endsAt: string;
  progress: number;
}

interface ActivityItem {
  id: string;
  lessonTitle: string;
  courseTitle: string;
  status: string;
  score: number | null;
  createdAt: string;
}

interface WeeklyGoal {
  target: number;
  completed: number;
  xpThisWeek: number;
}

interface DashboardContentProps {
  name: string;
  stats: {
    courses: number;
    lessons: number;
    xp: number;
    streak: number;
    level: number;
    levelTitle: string;
    levelProgress: number;
    certificates: number;
    timeSpent: number;
  };
  enrollments: EnrollmentCourse[];
  continueLesson: ContinueLesson | null;
  recommendations?: RecommendedCourse[];
  seasonalEvents?: ActiveEvent[];
  recentActivity?: ActivityItem[];
  weeklyGoal?: WeeklyGoal;
}

interface StatCard {
  label: string;
  value: number | string;
  icon: typeof BookOpen;
  gradient: string;
  delay: number;
}

const difficultyColors: Record<string, string> = {
  beginner: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  intermediate: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  advanced: "bg-red-500/20 text-red-400 border-red-500/30",
};

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function DashboardContent({ name, stats, enrollments, continueLesson, recommendations, seasonalEvents, recentActivity, weeklyGoal }: DashboardContentProps) {
  return (
    <div className="space-y-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: easing }}
      >
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Welcome back, <span className="gradient-text-accent">{name}</span>!
        </h1>
        <p className="mt-2 text-muted-foreground">
          Here&apos;s an overview of your learning journey.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.18, ease: easing }}
      >
        <WeaknessAlert />
      </motion.div>

      {seasonalEvents && seasonalEvents.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: easing }}
        >
          <SeasonalEventsContent events={seasonalEvents} />
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: easing }}
      >
        <StreakNotificationsWidget />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.25, ease: easing }}
      >
        <SpacedRepetitionWidget />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.27, ease: easing }}
        id="foundation-rebuilder"
        className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-6 shadow-xl"
      >
        <FoundationRebuilder />
      </motion.div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {([
          { label: "Enrolled Courses", value: stats.courses, icon: BookOpen, gradient: "from-primary-500/20 via-primary-500/5 to-transparent", delay: 0 },
          { label: "Completed Lessons", value: stats.lessons, icon: CheckCircle, gradient: "from-accent-500/20 via-accent-500/5 to-transparent", delay: 0.1 },
          { label: "XP Points", value: stats.xp, icon: Zap, gradient: "from-secondary-500/20 via-secondary-500/5 to-transparent", delay: 0.2 },
          { label: "Time Spent", value: formatTime(stats.timeSpent), icon: Timer, gradient: "from-cyan-500/20 via-cyan-500/5 to-transparent", delay: 0.25 },
          { label: "Certificates", value: stats.certificates, icon: TrendingUp, gradient: "from-emerald-500/20 via-emerald-500/5 to-transparent", delay: 0.3 },
        ] as StatCard[]).map((card) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: card.delay, ease: easing }}
              whileHover={{ y: -4, transition: { duration: 0.3 } }}
              className="group relative overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-6 shadow-xl transition-all duration-500 hover:border-[rgba(255,255,255,0.12)] hover:shadow-primary-500/10"
            >
              <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />
              <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary-500/5 blur-[60px] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative z-10 flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <p className="mt-2 font-heading text-4xl font-bold tracking-tight text-foreground">{card.value}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-primary-400">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {continueLesson && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25, ease: easing }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-xl font-bold tracking-tight text-foreground">Continue Learning</h2>
          </div>
          <Link href={`/courses/${continueLesson.courseId}/lessons/${continueLesson.id}`}>
            <motion.div
              whileHover={{ y: -2, transition: { duration: 0.3 } }}
              className="group relative overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.06)] bg-gradient-to-br from-accent-500/5 to-transparent p-5 shadow-xl transition-all duration-500 hover:border-[rgba(255,255,255,0.12)]"
            >
              <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-accent-500/10 blur-[60px]" />
              <div className="relative z-10 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-accent-400">{continueLesson.courseTitle}</p>
                  <p className="font-heading text-base font-bold text-foreground">{continueLesson.title}</p>
                  {continueLesson.estimatedMinutes && (
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {continueLesson.estimatedMinutes} min
                    </p>
                  )}
                </div>
                <div className="flex h-9 items-center gap-1.5 rounded-lg bg-accent-500/15 px-4 text-sm font-medium text-accent-400 transition-colors group-hover:bg-accent-500/25">
                  Resume <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </motion.div>
          </Link>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: easing }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-heading text-xl font-bold tracking-tight text-foreground">Active Courses</h2>
            <p className="mt-1 text-sm text-muted-foreground">Continue where you left off</p>
          </div>
          <Link
            href="/dashboard/courses"
            className="group flex items-center gap-1 text-sm font-medium text-primary-400 transition-colors hover:text-primary-300"
          >
            View all
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {enrollments.length === 0 ? (
          <div className="glass-card flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-4 text-center">
              <BookOpen className="h-10 w-10 text-muted-foreground/40" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">No active courses yet</p>
                <p className="mt-1 text-xs text-muted-foreground/60">Enroll in a course to get started</p>
              </div>
              <Link
                href="/courses"
                className="group relative inline-flex h-10 items-center gap-2 overflow-hidden rounded-xl bg-foreground px-6 text-sm font-semibold text-background transition-all hover:shadow-glow-sm"
              >
                Browse Courses
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {enrollments.map((enrollment, i) => {
              const course = enrollment.course;
              const diffColor = difficultyColors[course.difficulty] ?? "bg-gray-500/20 text-gray-400 border-gray-500/30";
              return (
                <div key={enrollment.id} className="group relative">
                  <Link href={`/courses/${course.id}`}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.05 * i, ease: easing }}
                      whileHover={{ y: -4, transition: { duration: 0.3 } }}
                      className="relative overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-5 shadow-xl transition-all duration-500 hover:border-[rgba(255,255,255,0.12)] hover:shadow-primary-500/10"
                    >
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                      {course.thumbnailUrl && (
                        <div className="relative z-10 mb-3 h-32 w-full overflow-hidden rounded-xl">
                          <img src={course.thumbnailUrl} alt={course.title} className="h-full w-full object-cover" />
                        </div>
                      )}

                      <div className="relative z-10 flex flex-wrap items-center gap-2 mb-2">
                        {course.category && (
                          <span className="rounded-full bg-primary-500/15 px-2.5 py-0.5 text-[10px] font-medium text-primary-400 ring-1 ring-inset ring-primary-500/25">
                            {course.category.name}
                          </span>
                        )}
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ring-1 ring-inset ${diffColor}`}>
                          {course.difficulty}
                        </span>
                      </div>

                      <h3 className="relative z-10 font-heading text-sm font-bold text-foreground line-clamp-1">{course.title}</h3>

                      {course.description && (
                        <p className="relative z-10 mt-1 text-xs text-muted-foreground line-clamp-2">{course.description}</p>
                      )}

                      <div className="relative z-10 mt-3 space-y-2">
                        <div className="flex h-1.5 overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-500"
                            style={{ width: `${Math.min(enrollment.progress, 100)}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-muted-foreground">{Math.round(enrollment.progress)}% complete</span>
                          {course.estimatedMinutes && (
                            <span className="flex items-center gap-1 text-muted-foreground/60">
                              <Clock className="h-3 w-3" />
                              {course.estimatedMinutes} min
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                  <button
                    onClick={async () => {
                      await fetch(`/api/enrollments/${enrollment.id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ archived: true }),
                      });
                      window.location.reload();
                    }}
                    className="absolute right-2 top-2 z-20 flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(0,0,0,0.6)] text-muted-foreground/50 opacity-0 transition-all hover:bg-red-500/20 hover:text-red-400 group-hover:opacity-100"
                    title="Archive course"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {recommendations && recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35, ease: easing }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-heading text-xl font-bold tracking-tight text-foreground">Recommended For You</h2>
              <p className="mt-1 text-sm text-muted-foreground">Based on your learning interests</p>
            </div>
            <Link href="/courses" className="group flex items-center gap-1 text-sm font-medium text-primary-400 transition-colors hover:text-primary-300">
              Browse all
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recommendations.map((course, i) => {
              const diffColor = difficultyColors[course.difficulty] ?? "bg-gray-500/20 text-gray-400 border-gray-500/30";
              return (
                <Link key={course.id} href={`/courses/${course.id}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.05 * i, ease: easing }}
                    whileHover={{ y: -3, transition: { duration: 0.3 } }}
                    className="group relative overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-4 shadow-xl transition-all duration-500 hover:border-[rgba(255,255,255,0.12)] hover:shadow-primary-500/10"
                  >
                    <div className="flex flex-wrap items-center gap-1.5 mb-2">
                      {course.category && (
                        <span className="rounded-full bg-primary-500/15 px-2 py-0.5 text-[9px] font-medium text-primary-400 ring-1 ring-inset ring-primary-500/25">
                          {course.category.name}
                        </span>
                      )}
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-medium ring-1 ring-inset ${diffColor}`}>
                        {course.difficulty}
                      </span>
                    </div>
                    <h3 className="font-heading text-sm font-bold text-foreground line-clamp-1">{course.title}</h3>
                    {course.teacher?.fullName && (
                      <p className="mt-1 text-[11px] text-muted-foreground/60">{course.teacher.fullName}</p>
                    )}
                    {course.description && (
                      <p className="mt-1 text-xs text-muted-foreground/70 line-clamp-2">{course.description}</p>
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4, ease: easing }}
      >
        <h2 className="font-heading text-xl font-bold tracking-tight text-foreground mb-6">Insights</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="relative overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-6 shadow-xl">
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary-500/10 blur-[60px]" />
            <div className="relative z-10 flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500/10 text-primary-400">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Learning Streak</p>
                <div className="mt-1 flex items-center gap-2">
                  <StreakFlame streak={stats.streak} />
                  <span className="text-xs text-muted-foreground">
                    {stats.streak === 0 ? "Complete a lesson to start your streak" : "Keep going!"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-6 shadow-xl">
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-accent-500/10 blur-[60px]" />
            <div className="relative z-10">
              <LevelProgress xp={stats.xp} />
            </div>
          </div>
        </div>
      </motion.div>

      {weeklyGoal && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45, ease: easing }}
        >
          <h2 className="font-heading text-xl font-bold tracking-tight text-foreground mb-6">Weekly Goals</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="relative overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-6 shadow-xl">
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald-500/10 blur-[60px]" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="h-5 w-5 text-emerald-400" />
                  <p className="text-sm font-medium text-foreground">Lessons This Week</p>
                </div>
                <div className="flex items-end gap-2">
                  <p className="font-heading text-4xl font-bold text-foreground">{weeklyGoal.completed}</p>
                  <p className="text-sm text-muted-foreground mb-1">/ {weeklyGoal.target} lessons</p>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-500"
                    style={{ width: `${Math.min((weeklyGoal.completed / weeklyGoal.target) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-6 shadow-xl">
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-yellow-500/10 blur-[60px]" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="h-5 w-5 text-yellow-400" />
                  <p className="text-sm font-medium text-foreground">XP This Week</p>
                </div>
                <p className="font-heading text-4xl font-bold text-foreground">{weeklyGoal.xpThisWeek.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">Keep earning XP to level up faster</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {recentActivity && recentActivity.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: easing }}
        >
          <h2 className="font-heading text-xl font-bold tracking-tight text-foreground mb-6">Recent Activity</h2>
          <div className="space-y-3">
            {recentActivity.slice(0, 5).map((activity, i) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="flex items-center gap-4 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-500/10">
                  {activity.status === "completed" ? (
                    <CheckCircle className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <Activity className="h-5 w-5 text-yellow-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{activity.lessonTitle}</p>
                  <p className="text-xs text-muted-foreground">{activity.courseTitle}</p>
                </div>
                <div className="text-right shrink-0">
                  {activity.score !== null && (
                    <p className="text-sm font-medium text-primary-400">{Math.round(activity.score)}%</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {new Date(activity.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
