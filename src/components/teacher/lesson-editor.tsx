"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Save } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { ErrorState } from "@/components/ui/error-state";
import { BlockPalette } from "@/components/teacher/block-palette";
import { TextEditor } from "@/components/teacher/block-editors/text-editor";
import { VideoEditor } from "@/components/teacher/block-editors/video-editor";
import { QuizEditor } from "@/components/teacher/block-editors/quiz-editor";
import { PdfEditor } from "@/components/teacher/block-editors/pdf-editor";
import { AssignmentEditor } from "@/components/teacher/block-editors/assignment-editor";

interface Block {
  id: string;
  type: string;
  content: Record<string, unknown>;
  sortOrder: number;
}

interface LessonData {
  id: string;
  title: string;
  description: string | null;
  content: { blocks: Block[] } | null;
}

interface LessonEditorProps {
  lessonId: string;
}

export function LessonEditor({ lessonId }: LessonEditorProps) {
  const queryClient = useQueryClient();

  const { data: lesson, isLoading, error } = useQuery({
    queryKey: ["lesson", lessonId],
    queryFn: async () => {
      const res = await fetch(`/api/lessons/${lessonId}`);
      if (!res.ok) throw new Error("Failed to fetch lesson");
      return res.json() as Promise<LessonData>;
    },
    enabled: !!lessonId,
  });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [initialized, setInitialized] = useState(false);

  if (lesson && !initialized) {
    setTitle(lesson.title);
    setDescription(lesson.description ?? "");
    setBlocks(lesson.content?.blocks ?? []);
    setInitialized(true);
  }

  const saveMutation = useMutation({
    mutationFn: async (data: { title: string; description?: string; content: { blocks: Block[] } }) => {
      const res = await fetch(`/api/lessons/${lessonId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save lesson");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lesson", lessonId] });
    },
  });

  function handleSave() {
    saveMutation.mutate({
      title,
      description: description || undefined,
      content: { blocks },
    });
  }

  function handleAddBlock(blockType: string) {
    const newBlock: Block = {
      id: crypto.randomUUID(),
      type: blockType,
      content: blockType === "divider" ? {} as Record<string, unknown> : {} as Record<string, unknown>,
      sortOrder: blocks.length,
    };
    if (blockType === "text") {
      newBlock.content = { markdown: "" } as unknown as Record<string, unknown>;
    }
    if (blockType === "quiz") {
      newBlock.content = {
        questions: [],
        passingScore: 70,
        shuffle: false,
        showCorrectAnswers: true,
        maxAttempts: 3,
        adaptive: { enabled: false, difficultyLevels: ["easy", "medium", "hard"] },
      } as unknown as Record<string, unknown>;
    }
    if (blockType === "video") {
      newBlock.content = { url: "", provider: "youtube", caption: "", transcript: "" } as unknown as Record<string, unknown>;
    }
    if (blockType === "pdf") {
      newBlock.content = { url: "", title: "" } as unknown as Record<string, unknown>;
    }
    if (blockType === "assignment") {
      newBlock.content = {
        title: "",
        instructions: "",
        maxScore: 100,
        allowFileUpload: true,
        maxFileSizeMB: 10,
      } as unknown as Record<string, unknown>;
    }
    setBlocks((prev) => [...prev, newBlock]);
  }

  function handleBlockContentChange(blockId: string, content: Record<string, unknown>) {
    setBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, content } : b)),
    );
  }

  function handleDeleteBlock(blockId: string) {
    setBlocks((prev) => prev.filter((b) => b.id !== blockId));
  }

  function renderBlockEditor(block: Block) {
    switch (block.type) {
      case "text":
        return (
          <TextEditor
            content={(block.content as { markdown?: string }).markdown ?? ""}
            onChange={(markdown) => handleBlockContentChange(block.id, { ...block.content, markdown })}
          />
        );
      case "video":
        return (
          <VideoEditor
            content={block.content}
            onChange={(content) => handleBlockContentChange(block.id, content)}
          />
        );
      case "quiz":
        return (
          <QuizEditor
            content={block.content}
            onChange={(content) => handleBlockContentChange(block.id, content)}
          />
        );
      case "pdf":
        return (
          <PdfEditor
            content={block.content}
            onChange={(content) => handleBlockContentChange(block.id, content)}
          />
        );
      case "assignment":
        return (
          <AssignmentEditor
            content={block.content}
            onChange={(content) => handleBlockContentChange(block.id, content)}
            onDelete={() => handleDeleteBlock(block.id)}
          />
        );
      case "image":
        return (
          <div className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-tertiary-foreground">
            Image block editor (URL, alt text, caption inputs)
          </div>
        );
      case "code":
        return (
          <div className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-tertiary-foreground">
            Code block editor (language + code editor)
          </div>
        );
      case "divider":
        return (
          <div className="py-2 text-center text-sm text-tertiary-foreground">Divider block</div>
        );
      default:
        return (
          <div className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-tertiary-foreground">
            Unknown block type: {block.type}
          </div>
        );
    }
  }

  if (isLoading) return <LoadingScreen fullScreen={false} />;

  if (error) return <ErrorState message={error.message} />;

  if (!lesson) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Lesson Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="lessonTitle">Title</Label>
            <Input
              id="lessonTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Lesson title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lessonDescription">Description</Label>
            <textarea
              id="lessonDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Lesson description"
              rows={3}
              className={cn(
                "flex min-h-[80px] w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground placeholder:text-tertiary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1",
              )}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_200px]">
        <div className="space-y-4">
          {blocks.map((block, index) => (
            <Card key={block.id}>
              <CardContent className="p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Block {index + 1} &mdash; {block.type}
                  </span>
                  <button
                    onClick={() => handleDeleteBlock(block.id)}
                    className="text-sm text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
                {renderBlockEditor(block)}
              </CardContent>
            </Card>
          ))}

          {!blocks.length && (
            <div className="rounded-lg border border-dashed border-border p-8 text-center text-tertiary-foreground">
              No blocks yet. Use the palette on the right to add content blocks.
            </div>
          )}
        </div>

        <div className="lg:sticky lg:top-6">
          <BlockPalette onAddBlock={handleAddBlock} />
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saveMutation.isPending}>
          {saveMutation.isPending ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
          ) : (
            <><Save className="h-4 w-4" /> Save Lesson</>
          )}
        </Button>
      </div>
    </div>
  );
}
