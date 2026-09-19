"use client";

import { CheckCircle2, XCircle, Lightbulb } from "lucide-react";

import { cn } from "@/lib/utils";

interface QuizFeedbackProps {
  isCorrect: boolean;
  explanation: string;
  hint?: string;
}

export function QuizFeedback({ isCorrect, explanation, hint }: QuizFeedbackProps) {
  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        isCorrect
          ? "border-emerald-200 bg-emerald-50"
          : "border-red-200 bg-red-50",
      )}
    >
      <div className="flex items-start gap-3">
        {isCorrect ? (
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
        ) : (
          <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
        )}
        <div>
          <p
            className={cn(
              "font-medium",
              isCorrect ? "text-emerald-800" : "text-red-800",
            )}
          >
            {isCorrect ? "Correct!" : "Incorrect"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{explanation}</p>
          {hint && !isCorrect && (
            <div className="mt-2 flex items-start gap-2 rounded-md bg-amber-50 p-3">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <p className="text-sm text-amber-800">{hint}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
