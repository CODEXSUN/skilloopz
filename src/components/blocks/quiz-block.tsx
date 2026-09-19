"use client";

import { useState, useCallback } from "react";
import { QuizTimer } from "@/components/blocks/quiz-timer";
import { QuizFeedback } from "@/components/blocks/quiz-feedback";
import { QuizResults } from "@/components/blocks/quiz-results";
import type { QuizBlockConfig, QuizQuestion } from "@/types/blocks/quiz-block";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuizBlockProps {
  content: Record<string, unknown>;
  lessonId?: string;
  blockId?: string;
}

interface AnswerRecord {
  questionId: string;
  selected: string | string[];
}

export function QuizBlock({ content, lessonId = "", blockId = "" }: QuizBlockProps) {
  const config = content as unknown as QuizBlockConfig & { questions?: QuizQuestion[] };
  const questions = config.questions ?? [];
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState<string | string[]>("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const question = questions[currentQuestion];

  const checkAnswer = useCallback(
    (selected: string | string[]): boolean => {
      if (!question) return false;

      if (question.type === "short-answer") {
        const userAnswer = (selected as string).trim().toLowerCase();
        const correct = (question.correctAnswer as string).trim().toLowerCase();
        return userAnswer === correct;
      }

      const correct = question.correctAnswer;

      if (Array.isArray(correct) && Array.isArray(selected)) {
        return (
          correct.length === selected.length &&
          correct.every((c) => selected.includes(c))
        );
      }

      return selected === correct;
    },
    [question],
  );

  function handleSubmit() {
    if (!currentAnswer || submitted) return;

    const correct = checkAnswer(currentAnswer);
    setIsCorrect(correct);
    setShowFeedback(true);
    setSubmitted(true);
  }

  function handleNext() {
    setAnswers((prev) => [
      ...prev,
      {
        questionId: question.id,
        selected: currentAnswer,
      },
    ]);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((q) => q + 1);
      setCurrentAnswer("");
      setShowFeedback(false);
      setIsCorrect(false);
      setSubmitted(false);
    } else {
      const finalAnswers = [
        ...answers,
        { questionId: question.id, selected: currentAnswer },
      ];
      setShowResults(true);
      saveAttempt(finalAnswers);
    }
  }

  async function saveAttempt(finalAnswers: AnswerRecord[]) {
    const score = finalAnswers.filter((a) => {
      const q = questions.find((q) => q.id === a.questionId);
      if (!q) return false;
      return checkAnswer(a.selected);
    }).length;

    try {
      await fetch(`/api/quizzes/${blockId}/attempt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId,
          score,
          total: questions.length,
          answers: finalAnswers,
          timeSpent,
        }),
      });
    } catch {
      // Silently fail attempt save
    }
  }

  if (!questions.length) {
    return (
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-tertiary-foreground">
        No questions in this quiz
      </div>
    );
  }

  if (showResults) {
    return (
      <QuizResults
        answers={answers}
        questions={questions}
        timeSpent={timeSpent}
        onRetry={() => {
          setCurrentQuestion(0);
          setAnswers([]);
          setCurrentAnswer("");
          setShowResults(false);
          setShowFeedback(false);
          setSubmitted(false);
          setTimeSpent(0);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Question {currentQuestion + 1} of {questions.length}
        </div>
        {config.timeLimit && (
          <QuizTimer
            timeLimit={config.timeLimit}
            onTimeUp={() => {
              setSubmitted(true);
              handleNext();
            }}
            onTick={setTimeSpent}
          />
        )}
      </div>

      <div className="rounded-lg border p-6">
        <h3 className="mb-4 text-lg font-medium">{question.text}</h3>

        {question.type === "mcq" && (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  if (!submitted) setCurrentAnswer(option.id);
                }}
                className={cn(
                  "w-full rounded-lg border p-3 text-left transition-colors",
                  currentAnswer === option.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-border",
                  submitted && "cursor-default",
                )}
                disabled={submitted}
              >
                {option.text}
              </button>
            ))}
          </div>
        )}

        {question.type === "msq" && (
          <div className="space-y-2">
            {question.options?.map((option) => {
              const selected = Array.isArray(currentAnswer)
                ? currentAnswer.includes(option.id)
                : false;

              return (
                <button
                  key={option.id}
                  onClick={() => {
                    if (submitted) return;
                    setCurrentAnswer((prev) => {
                      const arr = Array.isArray(prev) ? prev : [];
                      return selected
                        ? arr.filter((id) => id !== option.id)
                        : [...arr, option.id];
                    });
                  }}
                  className={cn(
                    "w-full rounded-lg border p-3 text-left transition-colors",
                    selected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-border",
                    submitted && "cursor-default",
                  )}
                  disabled={submitted}
                >
                  {option.text}
                </button>
              );
            })}
          </div>
        )}

        {question.type === "true-false" && (
          <div className="flex gap-3">
            {["True", "False"].map((option) => (
              <button
                key={option}
                onClick={() => {
                  if (!submitted) setCurrentAnswer(option.toLowerCase());
                }}
                className={cn(
                  "flex-1 rounded-lg border p-4 text-center font-medium transition-colors",
                  currentAnswer === option.toLowerCase()
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-border",
                  submitted && "cursor-default",
                )}
                disabled={submitted}
              >
                {option}
              </button>
            ))}
          </div>
        )}

        {question.type === "fill-blank" && (
          <input
            type="text"
            value={typeof currentAnswer === "string" ? currentAnswer : ""}
            onChange={(e) => {
              if (!submitted) setCurrentAnswer(e.target.value);
            }}
            placeholder="Type your answer..."
            className="w-full rounded-lg border border-border p-3 focus:border-primary focus:outline-none"
            disabled={submitted}
          />
        )}

        {question.type === "short-answer" && (
          <textarea
            value={typeof currentAnswer === "string" ? currentAnswer : ""}
            onChange={(e) => {
              if (!submitted) setCurrentAnswer(e.target.value);
            }}
            placeholder="Type your answer..."
            className="w-full rounded-lg border border-border p-3 focus:border-primary focus:outline-none"
            disabled={submitted}
            rows={3}
          />
        )}
      </div>

      {!submitted ? (
        <Button onClick={handleSubmit} disabled={!currentAnswer}>
          Submit Answer
        </Button>
      ) : showFeedback && (
        <QuizFeedback
          isCorrect={isCorrect}
          explanation={question.explanation}
          hint={question.hint}
        />
      )}

      {submitted && (
        <Button onClick={handleNext}>
          {currentQuestion < questions.length - 1 ? "Next Question" : "See Results"}
        </Button>
      )}
    </div>
  );
}
