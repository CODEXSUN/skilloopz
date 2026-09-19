"use client";

import { CheckCircle2, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import type { QuizQuestion } from "@/types/blocks/quiz-block";

interface AnswerRecord {
  questionId: string;
  selected: string | string[];
}

interface QuizReviewProps {
  answers: AnswerRecord[];
  questions: QuizQuestion[];
}

export function QuizReview({ answers, questions }: QuizReviewProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-foreground">Review Answers</h3>

      {answers.map((answer, index) => {
        const question = questions.find((q) => q.id === answer.questionId);
        if (!question) return null;

        const correct = question.correctAnswer;
        let isCorrect = false;

        if (Array.isArray(correct) && Array.isArray(answer.selected)) {
          isCorrect =
            correct.length === answer.selected.length &&
            correct.every((c) => answer.selected.includes(c));
        } else {
          isCorrect = answer.selected === correct;
        }

        return (
          <div
            key={question.id}
            className={cn(
              "rounded-lg border p-4",
              isCorrect ? "border-emerald-200" : "border-red-200",
            )}
          >
            <div className="flex items-start gap-3">
              {isCorrect ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              ) : (
                <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
              )}

              <div className="flex-1">
                <p className="font-medium text-foreground">
                  Question {index + 1}: {question.text}
                </p>

                <div className="mt-2 space-y-1 text-sm">
                  <p className="text-muted-foreground">
                    <span className="font-medium">Your answer:</span>{" "}
                    {Array.isArray(answer.selected)
                      ? answer.selected.join(", ")
                      : answer.selected || "(no answer)"}
                  </p>

                  {!isCorrect && (
                    <p className="text-emerald-700">
                      <span className="font-medium">Correct answer:</span>{" "}
                      {Array.isArray(correct) ? correct.join(", ") : correct}
                    </p>
                  )}
                </div>

                <p className="mt-2 text-sm text-muted-foreground">
                  {question.explanation}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
