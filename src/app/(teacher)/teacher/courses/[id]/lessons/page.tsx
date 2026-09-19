"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Plus,
  FileText,
  Trash2,
  Loader2,
  ExternalLink,
} from "lucide-react";

import { useCourse } from "@/hooks/useCourses";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";

export default function CourseLessonsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: course, isLoading, error, refetch } = useCourse(params.id);

  const [newLesson, setNewLesson] = useState<Record<string, { title: string; description: string }>>({});
  const [creating, setCreating] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  if (isLoading) {
    return <LoadingScreen message="Loading lessons..." />;
  }

  if (error || !course) {
    return (
      <ErrorState
        message="Failed to load course"
        onRetry={() => refetch()}
      />
    );
  }

  const modules = course.modules ?? [];

  async function handleCreateLesson(moduleId: string) {
    const lesson = newLesson[moduleId];
    if (!lesson?.title.trim()) return;

    setCreating(moduleId);
    try {
      const moduleData = modules.find((m: { id: string }) => m.id === moduleId) as
        | { lessons?: { id: string }[] }
        | undefined;
      const nextOrder = (moduleData?.lessons?.length ?? 0) + 1;
      const res = await fetch("/api/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleId,
          title: lesson.title.trim(),
          description: lesson.description.trim() || null,
          sortOrder: nextOrder,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setNewLesson((prev) => {
        const next = { ...prev };
        delete next[moduleId];
        return next;
      });
      refetch();
    } catch {
      // Silently fail
    } finally {
      setCreating(null);
    }
  }

  async function handleDeleteLesson(lessonId: string) {
    setDeleting(lessonId);
    try {
      await fetch(`/api/lessons/${lessonId}`, { method: "DELETE" });
      refetch();
    } catch {
      // Silently fail
    } finally {
      setDeleting(null);
    }
  }

  if (modules.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{course.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage lessons.</p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push(`/teacher/courses/${params.id}/modules`)}
          >
            Manage Modules
          </Button>
        </div>
        <EmptyState
          title="No modules yet"
          description="Create modules first, then add lessons to each module."
          actionLabel="Go to Modules"
          onAction={() => router.push(`/teacher/courses/${params.id}/modules`)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{course.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Lessons grouped by module.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push(`/teacher/courses/${params.id}/modules`)}
        >
          Manage Modules
        </Button>
      </div>

      {modules.map((mod: { id: string; title: string; description: string | null; lessons?: { id: string; title: string; description: string | null; estimatedMinutes: number | null }[] }) => (
        <Card key={mod.id}>
          <CardHeader>
            <CardTitle>{mod.title}</CardTitle>
            {mod.description && (
              <CardDescription>{mod.description}</CardDescription>
            )}
          </CardHeader>

          <div className="space-y-2 px-6 pb-4">
            <div className="space-y-2">
              <Label htmlFor={`lesson-title-${mod.id}`}>New Lesson Title</Label>
              <div className="flex gap-2">
                <Input
                  id={`lesson-title-${mod.id}`}
                  value={newLesson[mod.id]?.title ?? ""}
                  onChange={(e) =>
                    setNewLesson((prev) => ({
                      ...prev,
                      [mod.id]: {
                        title: e.target.value,
                        description: prev[mod.id]?.description ?? "",
                      },
                    }))
                  }
                  placeholder="Lesson title"
                />
                <Button
                  size="sm"
                  disabled={creating === mod.id || !newLesson[mod.id]?.title.trim()}
                  onClick={() => handleCreateLesson(mod.id)}
                >
                  {creating === mod.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  Add
                </Button>
              </div>
            </div>
          </div>

          {(!mod.lessons || mod.lessons.length === 0) ? (
            <div className="px-6 pb-4 text-sm text-tertiary-foreground">
              No lessons in this module yet.
            </div>
          ) : (
            <div className="divide-y border-t border-border">
              {mod.lessons.map(
                (lesson: { id: string; title: string; description: string | null; estimatedMinutes: number | null }) => (
                  <div
                    key={lesson.id}
                    className="flex items-center gap-3 px-6 py-3"
                  >
                    <FileText className="h-4 w-4 shrink-0 text-tertiary-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {lesson.title}
                      </p>
                      {lesson.description && (
                        <p className="text-xs text-muted-foreground truncate">
                          {lesson.description}
                        </p>
                      )}
                    </div>
                    {lesson.estimatedMinutes && (
                      <span className="text-xs text-tertiary-foreground shrink-0">
                        {lesson.estimatedMinutes} min
                      </span>
                    )}
                    <Link
                      href={`/teacher/lessons/${lesson.id}/edit`}
                    >
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-4 w-4" />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={deleting === lesson.id}
                      onClick={() => handleDeleteLesson(lesson.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      {deleting === lesson.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ),
              )}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
