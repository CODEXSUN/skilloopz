"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QuizQuestionEditor } from "@/components/teacher/block-editors/quiz-question-editor";
import { QuizAutoGenerate } from "@/components/ai/quiz-auto-generate";
import type { QuizQuestion } from "@/types/blocks/quiz-block";

interface QuizEditorProps {
  content: Record<string, unknown>;
  onChange: (content: Record<string, unknown>) => void;
}

export function QuizEditor({ content, onChange }: QuizEditorProps) {
  const config = content as {
    questions?: QuizQuestion[];
    passingScore?: number;
    shuffle?: boolean;
    showCorrectAnswers?: boolean;
    maxAttempts?: number;
    timeLimit?: number;
    adaptive?: {
      enabled: boolean;
      difficultyLevels: ("easy" | "medium" | "hard")[];
    };
  };

  const questions = config.questions ?? [];

  function updateQuestions(newQuestions: QuizQuestion[]) {
    onChange({ ...content, questions: newQuestions });
  }

  function addQuestion() {
    const newQuestion: QuizQuestion = {
      id: crypto.randomUUID(),
      type: "mcq",
      text: "",
      options: [
        { id: crypto.randomUUID(), text: "" },
        { id: crypto.randomUUID(), text: "" },
      ],
      correctAnswer: "",
      explanation: "",
      difficulty: "easy",
      points: 1,
    };
    updateQuestions([...questions, newQuestion]);
  }

  function handleAiInsert(newQuestions: QuizQuestion[]) {
    updateQuestions([...questions, ...newQuestions]);
  }

  function deleteQuestion(id: string) {
    updateQuestions(questions.filter((q) => q.id !== id));
  }

  function updateQuestion(id: string, data: QuizQuestion) {
    updateQuestions(questions.map((q) => (q.id === id ? data : q)));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="text-sm font-medium text-foreground">
          {questions.length} {questions.length === 1 ? "question" : "questions"}
        </span>
        <div className="flex gap-2">
          <QuizAutoGenerate onInsert={handleAiInsert} existingQuestions={questions} />
          <Button type="button" size="sm" onClick={addQuestion}>
            <Plus className="h-4 w-4" /> Add Question
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="space-y-1">
          <Label className="text-xs">Passing Score (%)</Label>
          <Input
            type="number"
            min={0}
            max={100}
            value={config.passingScore ?? 70}
            onChange={(e) => onChange({ ...content, passingScore: parseInt(e.target.value, 10) || 0 })}
            className="w-20"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Max Attempts</Label>
          <Input
            type="number"
            min={1}
            value={config.maxAttempts ?? 3}
            onChange={(e) => onChange({ ...content, maxAttempts: parseInt(e.target.value, 10) || 1 })}
            className="w-20"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Time Limit (min)</Label>
          <Input
            type="number"
            min={0}
            value={config.timeLimit ?? 0}
            onChange={(e) => onChange({ ...content, timeLimit: parseInt(e.target.value, 10) || undefined })}
            className="w-20"
          />
        </div>
      </div>

      <div className="space-y-3">
        {questions.map((question, index) => (
          <Card key={question.id} size="sm">
            <CardHeader className="mb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  Question {index + 1}
                </CardTitle>
                <button
                  type="button"
                  onClick={() => deleteQuestion(question.id)}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <QuizQuestionEditor
                question={question}
                onChange={(data) => updateQuestion(question.id, data)}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {!questions.length && (
        <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-tertiary-foreground">
          No questions yet. Click &ldquo;Add Question&rdquo; to create one, or use AI to generate.
        </div>
      )}
    </div>
  );
}
