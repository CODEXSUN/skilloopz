"use client";

import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { QuizReview } from "@/components/blocks/quiz-review";
import type { QuizQuestion } from "@/types/blocks/quiz-block";

interface AnswerRecord {
  questionId: string;
  selected: string | string[];
}

interface QuizResultsProps {
  answers: AnswerRecord[];
  questions: QuizQuestion[];
  timeSpent: number;
  onRetry: () => void;
}

export function QuizResults({
  answers,
  questions,
  timeSpent,
  onRetry,
}: QuizResultsProps) {
  const correctCount = answers.filter((a) => {
    const q = questions.find((qq) => qq.id === a.questionId);
    if (!q) return false;

    const correct = q.correctAnswer;
    if (Array.isArray(correct) && Array.isArray(a.selected)) {
      return (
        correct.length === a.selected.length &&
        correct.every((c) => a.selected.includes(c))
      );
    }
    return a.selected === correct;
  }).length;

  const total = questions.length;
  const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  const minutes = Math.floor(timeSpent / 60);
  const seconds = timeSpent % 60;

  const passed = percentage >= 70;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-white p-6 text-center">
        <div className="mb-2 text-5xl font-bold">{percentage}%</div>
        <p className="text-lg text-muted-foreground">
          {correctCount} of {total} correct
        </p>
        <div className="mt-4 flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <span>
            Time: {minutes}:{seconds.toString().padStart(2, "0")}
          </span>
          <span
            className={
              passed
                ? "rounded-full bg-emerald-100 px-2.5 py-0.5 font-medium text-emerald-700"
                : "rounded-full bg-amber-100 px-2.5 py-0.5 font-medium text-amber-700"
            }
          >
            {passed ? "Passed" : "Needs improvement"}
          </span>
        </div>

        <Button variant="outline" className="mt-6" onClick={onRetry}>
          <RotateCcw className="mr-1 h-4 w-4" />
          Retry Quiz
        </Button>
      </div>

      <QuizReview answers={answers} questions={questions} />
    </div>
  );
}
