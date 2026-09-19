"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Plus,
  GripVertical,
  Trash2,
  Loader2,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

import { useCourse } from "@/hooks/useCourses";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";

export default function CourseModulesPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: course, isLoading, error, refetch } = useCourse(params.id);

  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  if (isLoading) {
    return <LoadingScreen message="Loading modules..." />;
  }

  if (error || !course) {
    return (
      <ErrorState
        message="Failed to load course"
        onRetry={() => refetch()}
      />
    );
  }

  async function handleCreateModule(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setCreating(true);
    setFormError(null);
    try {
      const nextOrder = (course.modules?.length ?? 0) + 1;
      const res = await fetch("/api/modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: params.id,
          title: newTitle.trim(),
          description: newDescription.trim() || null,
          sortOrder: nextOrder,
        }),
      });
      if (!res.ok) throw new Error("Failed to create module");
      setNewTitle("");
      setNewDescription("");
      refetch();
    } catch {
      setFormError("Failed to create module");
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteModule(moduleId: string) {
    setDeleting(moduleId);
    try {
      await fetch(`/api/modules/${moduleId}`, { method: "DELETE" });
      refetch();
    } catch {
      // Silently fail
    } finally {
      setDeleting(null);
    }
  }

  async function handleReorder(moduleId: string, direction: "up" | "down") {
    const modules = course.modules ?? [];
    const idx = modules.findIndex((m: { id: string }) => m.id === moduleId);
    if (idx === -1) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= modules.length) return;

    const current = modules[idx] as { id: string; sortOrder: number };
    const swap = modules[swapIdx] as { id: string; sortOrder: number };

    await Promise.all([
      fetch(`/api/modules/${current.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sortOrder: swap.sortOrder }),
      }),
      fetch(`/api/modules/${swap.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sortOrder: current.sortOrder }),
      }),
    ]);

    refetch();
  }

  const modules = course.modules ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{course.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage modules for this course.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push(`/teacher/courses/${params.id}/lessons`)}
        >
          Manage Lessons
        </Button>
      </div>

      <Card>
        <form onSubmit={handleCreateModule} className="space-y-4">
          <CardHeader>
            <CardTitle>Add Module</CardTitle>
          </CardHeader>
          {formError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {formError}
            </div>
          )}
          <div className="space-y-2 px-6">
            <Label htmlFor="moduleTitle" required>Title</Label>
            <Input
              id="moduleTitle"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Week 1: Fundamentals"
            />
          </div>
          <div className="space-y-2 px-6">
            <Label htmlFor="moduleDescription">Description</Label>
            <Textarea
              id="moduleDescription"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              rows={2}
              placeholder="Brief description of this module"
            />
          </div>
          <div className="flex justify-end px-6 pb-6">
            <Button type="submit" disabled={creating || !newTitle.trim()}>
              {creating && <Loader2 className="h-4 w-4 animate-spin" />}
              <Plus className="h-4 w-4" />
              Add Module
            </Button>
          </div>
        </form>
      </Card>

      {modules.length === 0 ? (
        <EmptyState
          title="No modules yet"
          description="Add your first module to start structuring the course."
        />
      ) : (
        <div className="space-y-3">
          {modules.map((mod: { id: string; title: string; description: string | null; sortOrder: number; lessons?: { id: string }[] }, idx: number) => (
            <Card key={mod.id} size="sm">
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-0.5 text-tertiary-foreground">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleReorder(mod.id, "up")}
                    className="disabled:opacity-30 hover:text-muted-foreground"
                  >
                    <ArrowUp className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === modules.length - 1}
                    onClick={() => handleReorder(mod.id, "down")}
                    className="disabled:opacity-30 hover:text-muted-foreground"
                  >
                    <ArrowDown className="h-3 w-3" />
                  </button>
                </div>
                <GripVertical className="h-5 w-5 shrink-0 text-tertiary-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{mod.title}</p>
                  {mod.description && (
                    <p className="text-sm text-muted-foreground truncate">
                      {mod.description}
                    </p>
                  )}
                  <p className="text-xs text-tertiary-foreground">
                    {mod.lessons?.length ?? 0} lessons
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={deleting === mod.id}
                  onClick={() => handleDeleteModule(mod.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  {deleting === mod.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
