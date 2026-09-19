"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";

interface LessonLink {
  id: string;
  title: string;
  sortOrder: number;
}

interface NavigationButtonsProps {
  currentIndex: number;
  allLessons: LessonLink[];
  currentLessonIndex: number;
  isLastBlock: boolean;
  isCompleted: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onComplete: () => void;
}

export function NavigationButtons({
  currentIndex,
  allLessons,
  currentLessonIndex,
  isLastBlock,
  isCompleted,
  onPrevious,
  onNext,
  onComplete,
}: NavigationButtonsProps) {
  const previousLesson = currentLessonIndex > 0
    ? allLessons[currentLessonIndex - 1]
    : null;

  const nextLesson = currentLessonIndex < allLessons.length - 1
    ? allLessons[currentLessonIndex + 1]
    : null;

  return (
    <div className="mt-8 space-y-4">
      <div className="flex items-center justify-between gap-4 border-t pt-6">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Previous
        </Button>

        {isLastBlock ? (
          <Button onClick={onComplete} disabled={isCompleted}>
            {isCompleted ? (
              <>
                <CheckCircle2 className="mr-1 h-4 w-4" />
                Completed
              </>
            ) : (
              <>
                Complete Lesson
                <CheckCircle2 className="ml-1 h-4 w-4" />
              </>
            )}
          </Button>
        ) : (
          <Button onClick={onNext}>
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex items-center justify-between text-sm">
        {previousLesson ? (
          <Link
            href={`/lessons/${previousLesson.id}`}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-3 w-3" />
            {previousLesson.title}
          </Link>
        ) : (
          <div />
        )}

        {nextLesson && isCompleted && (
          <Link
            href={`/lessons/${nextLesson.id}`}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
          >
            {nextLesson.title}
            <ChevronRight className="h-3 w-3" />
          </Link>
        )}
      </div>
    </div>
  );
}
