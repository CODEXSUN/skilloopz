"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GripVertical, Plus, Trash2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { ErrorState } from "@/components/ui/error-state";

interface Module {
  id: string;
  title: string;
  description: string | null;
  sortOrder: number;
  lessons: { id: string }[];
}

interface ModuleManagerProps {
  courseId: string;
}

export function ModuleManager({ courseId }: ModuleManagerProps) {
  const queryClient = useQueryClient();
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const { data: modules, isLoading, error } = useQuery({
    queryKey: ["course-modules", courseId],
    queryFn: async () => {
      const res = await fetch(`/api/courses/${courseId}/modules`);
      if (!res.ok) throw new Error("Failed to fetch modules");
      return res.json() as Promise<Module[]>;
    },
    enabled: !!courseId,
  });

  const addMutation = useMutation({
    mutationFn: async (data: { title: string; description?: string }) => {
      const res = await fetch(`/api/courses/${courseId}/modules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to add module");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-modules", courseId] });
      setNewTitle("");
      setNewDescription("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (moduleId: string) => {
      const res = await fetch(`/api/courses/${courseId}/modules/${moduleId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete module");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-modules", courseId] });
    },
  });

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addMutation.mutate({ title: newTitle.trim(), description: newDescription.trim() || undefined });
  }

  if (isLoading) return <LoadingScreen fullScreen={false} />;

  if (error) return <ErrorState message={error.message} />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Modules</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleAdd} className="space-y-3 rounded-lg border p-4">
          <div className="space-y-2">
            <Label htmlFor="moduleTitle">Title</Label>
            <Input
              id="moduleTitle"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Module title"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="moduleDescription">Description</Label>
            <Input
              id="moduleDescription"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Module description (optional)"
            />
          </div>
          <Button type="submit" disabled={addMutation.isPending || !newTitle.trim()}>
            {addMutation.isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Adding...</>
            ) : (
              <><Plus className="h-4 w-4" /> Add Module</>
            )}
          </Button>
        </form>

        {!modules?.length ? (
          <EmptyState
            title="No modules yet"
            description="Add your first module above."
          />
        ) : (
          <div className="space-y-2">
            {modules.map((mod) => (
              <div
                key={mod.id}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                <GripVertical className="h-5 w-5 shrink-0 text-tertiary-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">{mod.title}</p>
                  {mod.description && (
                    <p className="truncate text-sm text-muted-foreground">{mod.description}</p>
                  )}
                </div>
                <Badge variant="secondary">
                  {mod.lessons.length} {mod.lessons.length === 1 ? "lesson" : "lessons"}
                </Badge>
                <button
                  onClick={() => deleteMutation.mutate(mod.id)}
                  className="shrink-0 rounded p-1 text-tertiary-foreground hover:bg-red-50 hover:text-red-500"
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
