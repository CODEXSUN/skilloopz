"use client";

import { Plus, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { QuizQuestion, QuizQuestionType } from "@/types/blocks/quiz-block";

interface QuizQuestionEditorProps {
  question: QuizQuestion;
  onChange: (question: QuizQuestion) => void;
}

export function QuizQuestionEditor({ question, onChange }: QuizQuestionEditorProps) {
  function updateField<K extends keyof QuizQuestion>(key: K, value: QuizQuestion[K]) {
    onChange({ ...question, [key]: value });
  }

  function addOption() {
    const options = [...(question.options ?? []), { id: crypto.randomUUID(), text: "" }];
    updateField("options", options);
  }

  function removeOption(id: string) {
    const options = (question.options ?? []).filter((o) => o.id !== id);
    updateField("options", options);
    if (question.correctAnswer === id) {
      updateField("correctAnswer", "");
    }
    if (Array.isArray(question.correctAnswer)) {
      updateField(
        "correctAnswer",
        (question.correctAnswer as string[]).filter((c) => c !== id),
      );
    }
  }

  function updateOption(id: string, text: string) {
    const options = (question.options ?? []).map((o) =>
      o.id === id ? { ...o, text } : o,
    );
    updateField("options", options);
  }

  function toggleCorrect(optionId: string) {
    if (question.type === "msq") {
      const current = Array.isArray(question.correctAnswer)
        ? (question.correctAnswer as string[])
        : [];
      const updated = current.includes(optionId)
        ? current.filter((c) => c !== optionId)
        : [...current, optionId];
      updateField("correctAnswer", updated as string[] & string);
    } else {
      updateField("correctAnswer", optionId as string & string[]);
    }
  }

  function handleTypeChange(type: string) {
    const qType = type as QuizQuestionType;
    const updated: Partial<QuizQuestion> = { type: qType, correctAnswer: "" };
    if (qType === "true-false") {
      updated.options = [
        { id: "true", text: "True" },
        { id: "false", text: "False" },
      ];
    } else if (qType === "fill-blank" || qType === "short-answer") {
      updated.options = undefined;
    } else if (qType === "mcq" || qType === "msq") {
      updated.options = question.options?.length
        ? question.options
        : [
            { id: crypto.randomUUID(), text: "" },
            { id: crypto.randomUUID(), text: "" },
          ];
    }
    onChange({ ...question, ...updated });
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="space-y-1">
          <Label className="text-xs">Type</Label>
          <Select value={question.type} onValueChange={handleTypeChange}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mcq">MCQ</SelectItem>
              <SelectItem value="msq">MSQ</SelectItem>
              <SelectItem value="true-false">True/False</SelectItem>
              <SelectItem value="fill-blank">Fill Blank</SelectItem>
              <SelectItem value="short-answer">Short Answer</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Difficulty</Label>
          <Select
            value={question.difficulty}
            onValueChange={(v) => updateField("difficulty", v as "easy" | "medium" | "hard")}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Points</Label>
          <Input
            type="number"
            min={0}
            value={question.points}
            onChange={(e) => updateField("points", parseInt(e.target.value, 10) || 0)}
            className="h-8 text-xs"
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Question Text</Label>
        <textarea
          value={question.text}
          onChange={(e) => updateField("text", e.target.value)}
          placeholder="Enter your question..."
          rows={2}
          className={cn(
            "w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground placeholder:text-tertiary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1",
          )}
        />
      </div>

      {(question.type === "mcq" || question.type === "msq") && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Options</Label>
            <Button type="button" size="sm" variant="ghost" onClick={addOption}>
              <Plus className="h-3 w-3" /> Add
            </Button>
          </div>
          {(question.options ?? []).map((option) => (
            <div key={option.id} className="flex items-center gap-2">
              <input
                type={question.type === "mcq" ? "radio" : "checkbox"}
                name={`correct-${question.id}`}
                checked={
                  question.type === "mcq"
                    ? question.correctAnswer === option.id
                    : Array.isArray(question.correctAnswer) &&
                      (question.correctAnswer as string[]).includes(option.id)
                }
                onChange={() => toggleCorrect(option.id)}
                className="h-4 w-4 shrink-0 text-primary-600"
              />
              <Input
                value={option.text}
                onChange={(e) => updateOption(option.id, e.target.value)}
                placeholder="Option text"
                className="h-8 text-xs"
              />
              <button
                type="button"
                onClick={() => removeOption(option.id)}
                className="shrink-0 text-tertiary-foreground hover:text-red-500"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {question.type === "true-false" && (
        <div className="flex gap-4">
          {["true", "false"].map((val) => (
            <label key={val} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name={`tf-${question.id}`}
                checked={question.correctAnswer === val}
                onChange={() => updateField("correctAnswer", val as string & string[])}
                className="h-4 w-4 text-primary-600"
              />
              {val === "true" ? "True" : "False"}
            </label>
          ))}
        </div>
      )}

      {question.type === "fill-blank" && (
        <div className="space-y-1">
          <Label className="text-xs">Correct Answer</Label>
          <Input
            value={typeof question.correctAnswer === "string" ? question.correctAnswer : ""}
            onChange={(e) => updateField("correctAnswer", e.target.value as string & string[])}
            placeholder="The correct answer"
            className="h-8 text-xs"
          />
        </div>
      )}

      {question.type === "short-answer" && (
        <div className="space-y-1">
          <Label className="text-xs">Correct Answer</Label>
          <Input
            value={typeof question.correctAnswer === "string" ? question.correctAnswer : ""}
            onChange={(e) => updateField("correctAnswer", e.target.value as string & string[])}
            placeholder="The correct answer"
            className="h-8 text-xs"
          />
        </div>
      )}

      <div className="space-y-1">
        <Label className="text-xs">Explanation</Label>
        <textarea
          value={question.explanation}
          onChange={(e) => updateField("explanation", e.target.value)}
          placeholder="Explain the correct answer..."
          rows={2}
          className={cn(
            "w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground placeholder:text-tertiary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1",
          )}
        />
      </div>
    </div>
  );
}
