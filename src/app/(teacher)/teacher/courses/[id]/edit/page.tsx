"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { useCourse, useUpdateCourse } from "@/hooks/useCourses";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { ErrorState } from "@/components/ui/error-state";

function EditCourseForm({
  course,
  onSaved,
}: {
  course: { id: string; title: string; description?: string | null; subject?: string | null; gradeLevel?: string | null; difficulty?: string; estimatedMinutes?: number | null };
  onSaved: () => void;
}) {
  const updateCourse = useUpdateCourse(course.id);
  const [title, setTitle] = useState(course.title ?? "");
  const [description, setDescription] = useState(course.description ?? "");
  const [subject, setSubject] = useState(course.subject ?? "");
  const [gradeLevel, setGradeLevel] = useState(course.gradeLevel ?? "");
  const [difficulty, setDifficulty] = useState(course.difficulty ?? "");
  const [estimatedMinutes, setEstimatedMinutes] = useState(course.estimatedMinutes?.toString() ?? "");
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError("Title is required");
      return;
    }

    try {
      await updateCourse.mutateAsync({
        title: title.trim(),
        description: description.trim() || null,
        subject: subject.trim() || null,
        gradeLevel: gradeLevel.trim() || null,
        difficulty: difficulty || null,
        estimatedMinutes: estimatedMinutes ? Number(estimatedMinutes) : null,
      });
      onSaved();
    } catch {
      setFormError("Failed to update course. Please try again.");
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-5">
        {formError && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {formError}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="title" required>Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gradeLevel">Grade Level</Label>
            <Input
              id="gradeLevel"
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="estimatedMinutes">Estimated Minutes</Label>
            <Input
              id="estimatedMinutes"
              type="number"
              min={1}
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => window.history.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={updateCourse.isPending}>
            {updateCourse.isPending && (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            )}
            Save Changes
          </Button>
        </div>
      </form>
    </Card>
  );
}

export default function EditCoursePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: course, isLoading, error, refetch } = useCourse(params.id);

  if (isLoading) {
    return <LoadingScreen message="Loading course..." />;
  }

  if (error || !course) {
    return (
      <ErrorState
        message="Failed to load course"
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Edit Course</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update your course details.
        </p>
      </div>
      <EditCourseForm
        key={course.id}
        course={course}
        onSaved={() => router.push(`/teacher/courses/${params.id}/modules`)}
      />
    </div>
  );
}
