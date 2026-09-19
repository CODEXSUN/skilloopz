"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CourseFormData {
  title: string;
  description: string;
  subject: string;
  gradeLevel: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedMinutes: number;
}

interface CourseFormProps {
  initialData?: Partial<CourseFormData>;
  onSubmit: (data: CourseFormData) => void;
  isLoading: boolean;
}

export function CourseForm({ initialData, onSubmit, isLoading }: CourseFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [subject, setSubject] = useState(initialData?.subject ?? "");
  const [gradeLevel, setGradeLevel] = useState(initialData?.gradeLevel ?? "");
  const [difficulty, setDifficulty] = useState<CourseFormData["difficulty"]>(
    initialData?.difficulty ?? "beginner",
  );
  const [estimatedMinutes, setEstimatedMinutes] = useState(
    initialData?.estimatedMinutes?.toString() ?? "",
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      title,
      description,
      subject,
      gradeLevel,
      difficulty,
      estimatedMinutes: estimatedMinutes ? parseInt(estimatedMinutes, 10) : 0,
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? "Edit Course" : "Create Course"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" required>Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Course title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Course description"
              rows={4}
              className={cn(
                "flex min-h-[80px] w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground placeholder:text-tertiary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
              )}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Mathematics"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gradeLevel">Grade Level</Label>
              <Input
                id="gradeLevel"
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                placeholder="e.g. 9-12"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select
                value={difficulty}
                onValueChange={(v) => setDifficulty(v as CourseFormData["difficulty"])}
              >
                <SelectTrigger id="difficulty">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedMinutes">Estimated Duration (minutes)</Label>
              <Input
                id="estimatedMinutes"
                type="number"
                min={0}
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(e.target.value)}
                placeholder="e.g. 30"
              />
            </div>
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Course"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
