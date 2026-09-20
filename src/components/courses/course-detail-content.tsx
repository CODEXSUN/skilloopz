"use client";

import Link from "@/vite/platform/link";
import { Clock, BookOpen, Users, ArrowLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { ErrorState } from "@/components/ui/error-state";
import { EnrollButton } from "@/components/courses/enroll-button";
import { ModuleList } from "@/components/courses/module-list";
import { useCourse } from "@/hooks/useCourses";
const difficultyColors: Record<string, "default" | "secondary" | "outline"> = {
  beginner: "default",
  intermediate: "secondary",
  advanced: "outline",
};

export function CourseDetailContent({ courseId }: { courseId: string }) {
  const { data: course, isLoading, error } = useCourse(courseId);

  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorState message={error.message} />;
  if (!course) return <ErrorState message="Course not found" />;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <Link
        href="/courses"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to courses
      </Link>

      <div className="overflow-hidden rounded-xl border border-border bg-white">
        <div className="aspect-video bg-gradient-to-br from-primary-100 to-primary-50">
          {course.thumbnailUrl && (
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              className="h-full w-full object-cover"
            />
          )}
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Badge variant={difficultyColors[course.difficulty] ?? "default"}>
                  {course.difficulty}
                </Badge>
                {course.category && (
                  <Badge variant="secondary">{course.category.name}</Badge>
                )}
              </div>

              <h1 className="mt-3 text-2xl font-bold text-foreground">
                {course.title}
              </h1>

              {course.description && (
                <p className="mt-2 text-muted-foreground">{course.description}</p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {course.estimatedMinutes && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {course.estimatedMinutes} min
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {course.modules?.length ?? 0} modules
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {course._count?.enrollments ?? 0} enrolled
                </span>
                {course.teacher && (
                  <span className="text-tertiary-foreground">
                    by {course.teacher.fullName ?? "Unknown"}
                  </span>
                )}
              </div>
            </div>

            <EnrollButton courseId={course.id} />
          </div>
        </div>
      </div>

      {course.modules && course.modules.length > 0 && (
        <div>
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            Course Content
          </h2>
          <ModuleList modules={course.modules} />
        </div>
      )}
    </div>
  );
}
