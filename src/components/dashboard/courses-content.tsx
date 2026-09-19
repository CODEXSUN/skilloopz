"use client";

import { motion } from "framer-motion";
import { BookOpen, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

const easing = [0.16, 1, 0.3, 1] as const;

interface EnrollmentItem {
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

interface Props {
  enrollments: EnrollmentItem[];
}

export function DashboardCoursesContent({ enrollments }: Props) {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: easing }}
      >
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          My Courses
        </h1>
        <p className="mt-2 text-muted-foreground">
          Continue learning where you left off.
        </p>
      </motion.div>

      {enrollments.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: easing }}
          className="glass-card flex items-center justify-center py-20"
        >
          <div className="flex flex-col items-center gap-4 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground/40" />
            <div>
              <p className="text-base font-medium text-muted-foreground">No courses yet</p>
              <p className="mt-1 text-sm text-muted-foreground/60">Enroll in a course to start learning</p>
            </div>
            <Link
              href="/courses"
              className="group relative inline-flex h-11 items-center gap-2 overflow-hidden rounded-xl bg-foreground px-6 text-sm font-semibold text-background transition-all hover:shadow-glow-sm"
            >
              Browse Courses
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </motion.div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {enrollments.map((enrollment, i) => (
            <motion.div
              key={enrollment.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: easing }}
              whileHover={{ y: -4, transition: { duration: 0.3 } }}
            >
              <Link
                href={`/courses/${enrollment.course.id}`}
                className="group relative block overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-6 shadow-xl transition-all duration-500 hover:border-[rgba(255,255,255,0.12)] hover:shadow-primary-500/10"
              >
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                <div className="relative z-10">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-foreground tracking-tight truncate">
                        {enrollment.course.title}
                      </h3>
                      {enrollment.course.category && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {enrollment.course.category.name}
                        </p>
                      )}
                    </div>
                    {enrollment.course.estimatedMinutes && (
                      <div className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {enrollment.course.estimatedMinutes}m
                      </div>
                    )}
                  </div>

                  {enrollment.course.description && (
                    <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                      {enrollment.course.description}
                    </p>
                  )}

                  <div className="mt-5">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                      <span>Progress</span>
                      <span>{Math.round(enrollment.progress)}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[rgba(255,255,255,0.06)]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-700"
                        style={{ width: `${Math.min(enrollment.progress, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
