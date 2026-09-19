"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Check, X, Loader2, ExternalLink } from "lucide-react";

import { useCourse } from "@/hooks/useCourses";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { ErrorState } from "@/components/ui/error-state";

interface ChecklistItem {
  label: string;
  passed: boolean;
  hint?: string;
}

export default function PublishCoursePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: course, isLoading, error, refetch } = useCourse(params.id);
  const [publishing, setPublishing] = useState(false);
  const [archiving, setArchiving] = useState(false);

  if (isLoading) {
    return <LoadingScreen message="Checking readiness..." />;
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
  const totalLessons = modules.reduce(
    (sum: number, m: { lessons?: { id: string }[] }) =>
      sum + (m.lessons?.length ?? 0),
    0,
  );

  const checklist: ChecklistItem[] = [
    {
      label: "Course has a title",
      passed: !!course.title?.trim(),
    },
    {
      label: "Course has a description",
      passed: !!course.description?.trim(),
      hint: "Add a description in course settings",
    },
    {
      label: "Difficulty is set",
      passed: !!course.difficulty && ["beginner", "intermediate", "advanced"].includes(course.difficulty),
    },
    {
      label: "Course has at least one module",
      passed: modules.length > 0,
      hint: "Add modules to structure your course",
    },
    {
      label: "Each module has at least one lesson",
      passed: modules.length > 0 && modules.every(
        (m: { lessons?: { id: string }[] }) => (m.lessons?.length ?? 0) > 0,
      ),
      hint: "Every module needs at least one lesson",
    },
    {
      label: "Course has at least 3 lessons total",
      passed: totalLessons >= 3,
      hint: "Aim for at least 3 lessons",
    },
  ];

  const allPassed = checklist.every((item) => item.passed);
  const isPublished = course.status === "published";
  const isArchived = course.status === "archived";

  async function handleTogglePublish() {
    setPublishing(true);
    try {
      await fetch(`/api/courses/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: isPublished ? "draft" : "published",
        }),
      });
      refetch();
    } catch {
      // Silently fail
    } finally {
      setPublishing(false);
    }
  }

  async function handleArchive() {
    setArchiving(true);
    try {
      await fetch(`/api/courses/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: isArchived ? "draft" : "archived",
        }),
      });
      refetch();
    } catch {
      // Silently fail
    } finally {
      setArchiving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Publish Course</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review and publish your course.
          </p>
        </div>
        <Badge variant={isPublished ? "default" : isArchived ? "destructive" : "secondary"}>
          {isPublished ? "Published" : isArchived ? "Archived" : "Draft"}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{course.title}</CardTitle>
          {course.description && (
            <CardDescription>{course.description}</CardDescription>
          )}
        </CardHeader>
        <div className="space-y-2 px-6 pb-4 text-sm text-muted-foreground">
          <p>Difficulty: {course.difficulty ?? "Not set"}</p>
          <p>Modules: {modules.length}</p>
          <p>Lessons: {totalLessons}</p>
          {course.estimatedMinutes && (
            <p>Estimated time: {course.estimatedMinutes} minutes</p>
          )}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Publishing Checklist</CardTitle>
          <CardDescription>
            Complete all items before publishing.
          </CardDescription>
        </CardHeader>
        <div className="space-y-3 px-6 pb-6">
          {checklist.map((item) => (
            <div key={item.label} className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">
                {item.passed ? (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100">
                    <Check className="h-3 w-3 text-green-600" />
                  </div>
                ) : (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-100">
                    <X className="h-3 w-3 text-red-600" />
                  </div>
                )}
              </div>
              <div>
                <p
                  className={`text-sm font-medium ${
                    item.passed ? "text-foreground" : "text-foreground"
                  }`}
                >
                  {item.label}
                </p>
                {!item.passed && item.hint && (
                  <p className="text-xs text-red-500">{item.hint}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <Link
          href={`/courses/${params.id}`}
          target="_blank"
          className="text-sm text-primary-600 hover:text-primary-700 inline-flex items-center gap-1"
        >
          <ExternalLink className="h-4 w-4" />
          Preview course
        </Link>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
          {isArchived ? (
            <Button
              variant="outline"
              disabled={archiving}
              onClick={handleArchive}
            >
              {archiving && <Loader2 className="h-4 w-4 animate-spin" />}
              Unarchive
            </Button>
          ) : (
            <>
              {isPublished ? (
                <Button
                  variant="outline"
                  disabled={publishing}
                  onClick={handleTogglePublish}
                >
                  {publishing && <Loader2 className="h-4 w-4 animate-spin" />}
                  Unpublish
                </Button>
              ) : (
                <Button
                  disabled={!allPassed || publishing}
                  onClick={handleTogglePublish}
                >
                  {publishing && <Loader2 className="h-4 w-4 animate-spin" />}
                  Publish Course
                </Button>
              )}
              <Button
                variant="outline"
                disabled={archiving}
                onClick={handleArchive}
              >
                {archiving && <Loader2 className="h-4 w-4 animate-spin" />}
                Archive
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
