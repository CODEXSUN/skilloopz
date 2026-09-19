"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Save, Type, List, FileQuestion, Image, Code } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { ErrorState } from "@/components/ui/error-state";
import { LessonSkillMapper } from "@/components/teacher/lesson-skill-mapper";
import { ContentGenerator } from "@/components/ai/content-generator";

const BLOCK_TYPES = [
  { type: "text", icon: Type, label: "Text" },
  { type: "list", icon: List, label: "List" },
  { type: "quiz", icon: FileQuestion, label: "Quiz" },
  { type: "image", icon: Image, label: "Image" },
  { type: "code", icon: Code, label: "Code" },
] as const;

interface LessonData {
  id: string;
  title: string;
  description: string | null;
  content: string;
  estimatedMinutes: number | null;
  status: string;
  moduleId: string;
}

interface Block {
  id: string;
  type: string;
  data: Record<string, unknown>;
}

function parseContent(content: string): Block[] {
  try {
    return JSON.parse(content);
  } catch {
    return [];
  }
}

function useLesson(lessonId: string) {
  return useQuery({
    queryKey: ["lesson", lessonId],
    queryFn: async () => {
      const res = await fetch(`/api/lessons/${lessonId}`);
      if (!res.ok) throw new Error("Failed to fetch lesson");
      return res.json() as Promise<LessonData>;
    },
    enabled: !!lessonId,
  });
}

function useUpdateLesson(lessonId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch(`/api/lessons/${lessonId}/edit`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update lesson");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lesson", lessonId] });
    },
  });
}

function LessonEditorForm({
  lesson,
  onBack,
}: {
  lesson: LessonData;
  onBack: () => void;
}) {
  const updateLesson = useUpdateLesson(lesson.id);
  const [title, setTitle] = useState(lesson.title ?? "");
  const [description, setDescription] = useState(lesson.description ?? "");
  const [blocks, setBlocks] = useState<Block[]>(parseContent(lesson.content));
  const [saveError, setSaveError] = useState<string | null>(null);

  function addBlock(type: string) {
    setBlocks((prev) => [
      ...prev,
      { id: crypto.randomUUID(), type, data: {} },
    ]);
  }

  function removeBlock(blockId: string) {
    setBlocks((prev) => prev.filter((b) => b.id !== blockId));
  }

  function updateBlockData(blockId: string, data: Record<string, unknown>) {
    setBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, data } : b)),
    );
  }

  async function handleSave() {
    setSaveError(null);
    try {
      await updateLesson.mutateAsync({
        title: title.trim(),
        description: description.trim() || null,
        content: JSON.stringify(blocks),
      });
    } catch {
      setSaveError("Failed to save lesson");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Edit Lesson</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Build your lesson content.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={handleSave} disabled={updateLesson.isPending}>
            {updateLesson.isPending ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-1 h-4 w-4" />
            )}
            Save
          </Button>
        </div>
      </div>

      {saveError && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {saveError}
        </div>
      )}

      <Card>
        <div className="space-y-4">
          <div className="space-y-2 px-6 pt-6">
            <Label htmlFor="lessonTitle" required>Title</Label>
            <Input
              id="lessonTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2 px-6 pb-6">
            <Label htmlFor="lessonDescription">Description</Label>
            <Textarea
              id="lessonDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
        </div>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <ContentGenerator
            initialContent={description}
            onInsert={(generated) => {
              if (generated.questions) {
                const quizBlock = {
                  id: crypto.randomUUID(),
                  type: "quiz",
                  data: {
                    questions: generated.questions,
                  },
                };
                setBlocks((prev) => [...prev, quizBlock]);
              }
            }}
          />
        </CardContent>
      </Card>

      <div className="flex gap-6">
        <div className="flex-1 space-y-4">
          {blocks.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-12 text-center">
              <p className="text-sm text-muted-foreground">
                No content blocks yet. Add one from the palette.
              </p>
            </div>
          ) : (
            blocks.map((block) => (
              <Card key={block.id}>
                <div className="flex items-center justify-between border-b border-border px-6 py-2">
                  <span className="text-xs font-medium uppercase text-muted-foreground">
                    {block.type}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeBlock(block.id)}
                    className="h-6 px-2 text-red-500 hover:text-red-700"
                  >
                    Remove
                  </Button>
                </div>
                <div className="p-6">
                  <BlockEditor
                    block={block}
                    onChange={(data) => updateBlockData(block.id, data)}
                  />
                </div>
              </Card>
            ))
          )}
        </div>

        <div className="w-48 shrink-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Block Palette</CardTitle>
            </CardHeader>
            <div className="space-y-1 px-4 pb-4">
              {BLOCK_TYPES.map((bt) => {
                const Icon = bt.icon;
                return (
                  <Button
                    key={bt.type}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => addBlock(bt.type)}
                  >
                    <Icon className="h-4 w-4" />
                    {bt.label}
                  </Button>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <LessonSkillMapper lessonId={lesson.id} />
        </CardContent>
      </Card>
    </div>
  );
}

function BlockEditor({
  block,
  onChange,
}: {
  block: Block;
  onChange: (data: Record<string, unknown>) => void;
}) {
  switch (block.type) {
    case "text":
      return (
        <Textarea
          value={(block.data.content as string) ?? ""}
          onChange={(e) => onChange({ content: e.target.value })}
          placeholder="Enter text content..."
          rows={4}
        />
      );
    case "list":
      return (
        <Textarea
          value={(block.data.items as string) ?? ""}
          onChange={(e) => onChange({ items: e.target.value })}
          placeholder="Enter list items (one per line)..."
          rows={4}
        />
      );
    case "quiz":
      return (
        <div className="space-y-3">
          <Input
            value={(block.data.question as string) ?? ""}
            onChange={(e) =>
              onChange({ ...block.data, question: e.target.value })
            }
            placeholder="Question"
          />
          <Textarea
            value={((block.data.options as string[]) ?? []).join("\n")}
            onChange={(e) =>
              onChange({
                ...block.data,
                options: e.target.value.split("\n").filter(Boolean),
              })
            }
            placeholder="Options (one per line)"
            rows={3}
          />
          <Input
            value={(block.data.correctAnswer as string) ?? ""}
            onChange={(e) =>
              onChange({ ...block.data, correctAnswer: e.target.value })
            }
            placeholder="Correct answer"
          />
        </div>
      );
    case "image":
      return (
        <Input
          value={(block.data.url as string) ?? ""}
          onChange={(e) => onChange({ url: e.target.value })}
          placeholder="Image URL"
        />
      );
    case "code":
      return (
        <Textarea
          value={(block.data.code as string) ?? ""}
          onChange={(e) => onChange({ code: e.target.value })}
          placeholder="Enter code..."
          rows={6}
          className="font-mono text-sm"
        />
      );
    default:
      return <p className="text-sm text-tertiary-foreground">Unknown block type</p>;
  }
}

export default function LessonEditorPage() {
  const params = useParams<{ lessonId: string }>();
  const router = useRouter();
  const { data: lesson, isLoading, error, refetch } = useLesson(params.lessonId);

  if (isLoading) {
    return <LoadingScreen message="Loading lesson..." />;
  }

  if (error || !lesson) {
    return (
      <ErrorState
        message="Failed to load lesson"
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <LessonEditorForm
      key={lesson.id}
      lesson={lesson}
      onBack={() => router.back()}
    />
  );
}
