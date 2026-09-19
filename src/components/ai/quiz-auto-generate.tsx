"use client";

import { useState } from "react";
import { Sparkles, Loader2, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { QuizQuestion } from "@/types/blocks/quiz-block";

interface QuizAutoGenerateProps {
  onInsert: (questions: QuizQuestion[]) => void;
  existingQuestions?: QuizQuestion[];
}

const difficultyMap: Record<string, "easy" | "medium" | "hard"> = {
  beginner: "easy",
  intermediate: "medium",
  advanced: "hard",
};

export function QuizAutoGenerate({ onInsert, existingQuestions = [] }: QuizAutoGenerateProps) {
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(5);
  const [difficulty, setDifficulty] = useState("intermediate");
  const [questionTypes, setQuestionTypes] = useState<string[]>(["mcq", "true-false"]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleType = (type: string) => {
    setQuestionTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleGenerate = async () => {
    if (!topic.trim() || loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "quiz",
          content: topic.trim(),
          options: {
            questionCount: count,
            difficulty,
            questionTypes,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to generate questions");
        return;
      }

      const questions: QuizQuestion[] = (data.questions ?? []).map((q: Record<string, unknown>) => {
        const type = q.type === "truefalse" ? "true-false" : (q.type as QuizQuestion["type"]) ?? "mcq";
        return {
          id: crypto.randomUUID(),
          type,
          text: (q.question as string) ?? "",
          options: Array.isArray(q.options)
            ? q.options.map((opt: string, i: number) => ({
                id: crypto.randomUUID(),
                text: opt,
              }))
            : undefined,
          correctAnswer: (q.correctAnswer as string) ?? "",
          explanation: (q.explanation as string) ?? "",
          hint: (q.hint as string) ?? undefined,
          difficulty: difficultyMap[difficulty ?? "intermediate"] ?? "medium",
          points: 1,
        };
      }).filter((q: QuizQuestion) => q.text.length > 0);

      if (questions.length === 0) {
        setError("No questions were generated. Try a different topic.");
        return;
      }

      onInsert(questions);
      setOpen(false);
      setTopic("");
    } catch {
      setError("Failed to generate questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        <Sparkles className="h-4 w-4" />
        Generate with AI
      </Button>
    );
  }

  return (
    <div className="rounded-lg border border-primary-500/20 bg-primary-500/5 p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h4 className="font-medium text-foreground">AI Quiz Generator</h4>
      </div>

      <div className="space-y-2">
        <Label htmlFor="topic">Topic or Lesson Content</Label>
        <Textarea
          id="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter the topic or paste lesson content to generate questions from..."
          rows={3}
        />
      </div>

      <div className="flex gap-4">
        <div className="flex-1 space-y-1">
          <Label htmlFor="count">Number of Questions</Label>
          <select
            id="count"
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value))}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
          >
            {[3, 5, 8, 10, 15, 20].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 space-y-1">
          <Label htmlFor="diff">Difficulty</Label>
          <select
            id="diff"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Question Types</Label>
        <div className="flex flex-wrap gap-2">
          {[
            { id: "mcq", label: "Multiple Choice" },
            { id: "truefalse", label: "True/False" },
            { id: "fillblank", label: "Fill in the Blank" },
            { id: "shortanswer", label: "Short Answer" },
          ].map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => toggleType(type.id)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                questionTypes.includes(type.id)
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      <div className="flex gap-2">
        <Button
          type="button"
          onClick={handleGenerate}
          disabled={!topic.trim() || loading || questionTypes.length === 0}
          className="gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4" />
              Generate {count} Questions
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setOpen(false);
            setError(null);
          }}
        >
          Cancel
        </Button>
      </div>

      {existingQuestions.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline">{existingQuestions.length} existing questions</Badge>
          <span>Generated questions will be added to the end.</span>
        </div>
      )}
    </div>
  );
}
