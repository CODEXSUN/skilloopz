"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, X, Loader2, Globe } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PublishWorkflowProps {
  courseId: string;
  onPublished: () => void;
}

interface CourseData {
  id: string;
  title: string;
  description: string | null;
  modules: { id: string; lessons: { id: string }[] }[];
}

export function PublishWorkflow({ courseId, onPublished }: PublishWorkflowProps) {
  const queryClient = useQueryClient();
  const [publishError, setPublishError] = useState<string | null>(null);

  const { data: course, isLoading, error } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const res = await fetch(`/api/courses/${courseId}`);
      if (!res.ok) throw new Error("Failed to fetch course");
      return res.json() as Promise<CourseData>;
    },
    enabled: !!courseId,
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "published" }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? "Failed to publish");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      onPublished();
    },
    onError: (err: Error) => {
      setPublishError(err.message);
    },
  });

  const checks = [
    {
      label: "Course has a title",
      pass: !!course?.title,
    },
    {
      label: "Course has a description",
      pass: !!course?.description,
    },
    {
      label: "At least 1 module",
      pass: (course?.modules?.length ?? 0) > 0,
    },
    {
      label: "All modules have at least 1 lesson",
      pass:
        (course?.modules?.length ?? 0) > 0 &&
        (course?.modules ?? []).every((m) => (m.lessons?.length ?? 0) > 0),
    },
  ];

  const allPassed = checks.every((c) => c.pass);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin text-tertiary-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-red-500">Failed to load course data.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Publish Course</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {checks.map((check, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              {check.pass ? (
                <Check className="h-4 w-4 shrink-0 text-green-500" />
              ) : (
                <X className="h-4 w-4 shrink-0 text-red-500" />
              )}
              <span className={check.pass ? "text-foreground" : "text-muted-foreground"}>
                {check.label}
              </span>
            </div>
          ))}
        </div>

        {publishError && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {publishError}
          </div>
        )}

        <Button
          onClick={() => publishMutation.mutate()}
          disabled={!allPassed || publishMutation.isPending}
          className="w-full"
        >
          {publishMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Publishing...
            </>
          ) : (
            <>
              <Globe className="h-4 w-4" />
              Publish Course
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
