import Link from "next/link";
import { Clock, BookOpen, Users, Tag } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { CourseListItem } from "@/hooks/useCourses";

const difficultyColors: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  beginner: "default",
  intermediate: "secondary",
  advanced: "outline",
  expert: "destructive",
};

interface CourseCardProps {
  course: CourseListItem;
  enrolled?: boolean;
  progress?: number;
}

export function CourseCard({ course, enrolled, progress }: CourseCardProps) {
  return (
    <Link
      href={`/courses/${course.id}`}
      className="group relative block overflow-hidden rounded-[24px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] shadow-2xl transition-all duration-500 hover:border-[rgba(255,255,255,0.12)] hover:shadow-primary-500/10"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary-500/5 blur-[80px] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative z-10">
        <div className="aspect-video overflow-hidden">
          {course.thumbnailUrl ? (
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-500/20 via-primary-500/10 to-transparent">
              <span className="text-4xl font-bold text-primary-500/30">{course.title[0]}</span>
            </div>
          )}
        </div>

        <div className="p-5">
          <div className="flex items-center gap-2">
            <Badge variant={difficultyColors[course.difficulty] ?? "default"}>
              {course.difficulty}
            </Badge>
            {course.category && (
              <Badge variant="secondary">
                {course.category.name}
              </Badge>
            )}
          </div>

          {course.tags && course.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {course.tags.slice(0, 3).map((t) => (
                <span
                  key={t.tag.id}
                  className="inline-flex items-center gap-0.5 rounded-md bg-[rgba(255,255,255,0.04)] px-1.5 py-0.5 text-[10px] text-muted-foreground/70"
                >
                  <Tag className="h-2.5 w-2.5" />
                  {t.tag.name}
                </span>
              ))}
              {course.tags.length > 3 && (
                <span className="text-[10px] text-muted-foreground/50">+{course.tags.length - 3}</span>
              )}
            </div>
          )}

          <h3 className="mt-3 text-lg font-bold text-foreground tracking-tight transition-colors group-hover:text-primary-400">
            {course.title}
          </h3>

          {course.description && (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {course.description}
            </p>
          )}

          <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
            {course.estimatedMinutes && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {course.estimatedMinutes} min
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" />
              {course._count.modules} modules
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              {course._count.enrollments}
            </span>
          </div>

          {enrolled && progress !== undefined && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full rounded-full bg-[rgba(255,255,255,0.06)]">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-700",
                    progress >= 100 ? "bg-green-500" : "bg-primary-500",
                  )}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
