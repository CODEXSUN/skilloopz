"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLessonStore } from "@/stores/lessonStore";
import { useUpdateProgress } from "@/hooks/useLessonProgress";
import { BlockRenderer } from "@/components/blocks/block-renderer";
import { PlayerHeader } from "@/components/player/player-header";
import { NavigationButtons } from "@/components/player/navigation-buttons";
import { XpPopup } from "@/components/gamification/xp-popup";
import { AchievementPopup } from "@/components/gamification/achievement-popup";
import { BadgePopup } from "@/components/gamification/badge-popup";
import { BookmarkToggle } from "@/components/player/bookmark-toggle";
import { NotesPanel } from "@/components/player/notes-panel";
import { AiTutorChat } from "@/components/ai/ai-tutor-chat";
import { DifficultyIndicator } from "@/components/player/difficulty-indicator";
import { FileText, CheckCircle2, Bot } from "lucide-react";

interface LessonBlock {
  id: string;
  type: string;
  [key: string]: unknown;
}

interface LessonData {
  id: string;
  title: string;
  estimatedMinutes: number | null;
  module: {
    id: string;
    courseId: string;
    course: { title: string };
  };
}

interface LessonLink {
  id: string;
  title: string;
  sortOrder: number;
}

interface PlayerShellProps {
  lesson: LessonData;
  blocks: LessonBlock[];
  allLessons: LessonLink[];
  currentLessonIndex: number;
  userId: string;
}

export function LessonPlayer({
  lesson,
  blocks,
  allLessons,
  currentLessonIndex,
}: PlayerShellProps) {
  const router = useRouter();
  const [xpPopup, setXpPopup] = useState<{ amount: number; courseCompleted?: boolean } | null>(null);
  const [achievementQueue, setAchievementQueue] = useState<{ name: string; description: string; xpReward: number }[]>([]);
  const [currentAchievement, setCurrentAchievement] = useState<{ name: string; description: string; xpReward: number } | null>(null);
  const [badgeQueue, setBadgeQueue] = useState<{ name: string; description: string; icon: string; xpReward: number }[]>([]);
  const [currentBadge, setCurrentBadge] = useState<{ name: string; description: string; icon: string; xpReward: number } | null>(null);
  const [notesOpen, setNotesOpen] = useState(false);
  const [aiTutorOpen, setAiTutorOpen] = useState(false);

  const {
    currentBlockIndex,
    setCurrentBlock,
    setTotalBlocks,
    markBlockComplete,
    isCompleted,
    markCompleted,
    reset,
  } = useLessonStore();

  const { mutateAsync: saveProgress } = useUpdateProgress(lesson.id);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeSpentRef = useRef(0);

  useEffect(() => {
    queueMicrotask(() => {
      reset();
      setTotalBlocks(blocks.length);
    });

    progressIntervalRef.current = setInterval(() => {
      timeSpentRef.current += 30;
      saveProgress({ timeSpent: timeSpentRef.current });
    }, 30000);

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [lesson.id, blocks.length, reset, setTotalBlocks, saveProgress]);

  const handleXpPopupComplete = useCallback(() => {
    setXpPopup(null);
    if (achievementQueue.length > 0) {
      setCurrentAchievement(achievementQueue[0]);
    } else if (badgeQueue.length > 0) {
      setCurrentBadge(badgeQueue[0]);
    }
  }, [achievementQueue, badgeQueue]);

  const handleAchievementComplete = useCallback(() => {
    setAchievementQueue((prev) => {
      const [_, ...rest] = prev;
      if (rest.length > 0) {
        setCurrentAchievement(rest[0]);
      } else if (badgeQueue.length > 0) {
        setCurrentAchievement(null);
        setCurrentBadge(badgeQueue[0]);
      } else {
        setCurrentAchievement(null);
      }
      return rest;
    });
  }, [badgeQueue]);

  const handleBadgeComplete = useCallback(() => {
    setBadgeQueue((prev) => {
      const [_, ...rest] = prev;
      if (rest.length > 0) {
        setCurrentBadge(rest[0]);
      } else {
        setCurrentBadge(null);
      }
      return rest;
    });
  }, []);

  const handleComplete = useCallback(async () => {
    markCompleted();
    const result = await saveProgress({
      status: "completed",
      timeSpent: timeSpentRef.current,
    });
    if (result.xpAwarded > 0) {
      setXpPopup({ amount: result.xpAwarded, courseCompleted: result.courseCompleted });
    }
    const achievements = result.newAchievements;
    if (achievements && achievements.length > 0) {
      setAchievementQueue(achievements);
    }
    const badges = result.newBadges;
    if (badges && badges.length > 0) {
      setBadgeQueue(badges);
    }
    if (result.courseCompleted) {
      setTimeout(() => router.push(`/courses/${lesson.module.courseId}/certificate`), 3000);
    }
  }, [markCompleted, saveProgress]);

  if (blocks.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-muted-foreground">No content in this lesson yet.</p>
      </div>
    );
  }

  const currentBlock = blocks[currentBlockIndex];
  const isLastBlock = currentBlockIndex === blocks.length - 1;

  return (
    <div className="flex flex-1 flex-col">
      {xpPopup && (
        <XpPopup
          xp={xpPopup.amount}
          reason={xpPopup.courseCompleted ? "Course completed! 🎉" : "Lesson completed"}
          onComplete={handleXpPopupComplete}
        />
      )}
      {currentAchievement && (
        <AchievementPopup
          name={currentAchievement.name}
          description={currentAchievement.description}
          xpReward={currentAchievement.xpReward}
          onComplete={handleAchievementComplete}
        />
      )}
      {currentBadge && (
        <BadgePopup
          name={currentBadge.name}
          description={currentBadge.description}
          icon={currentBadge.icon}
          xpReward={currentBadge.xpReward}
          onComplete={handleBadgeComplete}
        />
      )}

      <div className="flex items-center justify-between border-b bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-foreground">{lesson.title}</h1>
          {isCompleted && (
            <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
              <CheckCircle2 className="h-3 w-3" />
              Completed
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <DifficultyIndicator lessonId={lesson.id} />
          <BookmarkToggle lessonId={lesson.id} />
          <button
            onClick={() => setAiTutorOpen(!aiTutorOpen)}
            className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
              aiTutorOpen
                ? "border-primary/30 bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
            title="AI Tutor"
          >
            <Bot className="h-4 w-4" />
          </button>
          <button
            onClick={() => setNotesOpen(!notesOpen)}
            className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
              notesOpen
                ? "border-primary/30 bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
            title="Lesson notes"
          >
            <FileText className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mx-auto max-w-3xl">
              <BlockRenderer block={currentBlock} lessonId={lesson.id} />

              <NavigationButtons
                currentIndex={currentBlockIndex}
                allLessons={allLessons}
                currentLessonIndex={currentLessonIndex}
                isLastBlock={isLastBlock}
                isCompleted={isCompleted}
                onPrevious={() => setCurrentBlock(currentBlockIndex - 1)}
                onNext={async () => {
                  markBlockComplete(currentBlockIndex);
                  if (isLastBlock) {
                    await handleComplete();
                  } else {
                    setCurrentBlock(currentBlockIndex + 1);
                  }
                }}
                onComplete={handleComplete}
              />
            </div>
          </div>
        </div>

        <div className={`transition-all duration-200 ${aiTutorOpen ? "w-96" : notesOpen ? "w-80" : "w-0"}`}>
          {aiTutorOpen && (
            <AiTutorChat
              lessonId={lesson.id}
              lessonTitle={lesson.title}
              onClose={() => setAiTutorOpen(false)}
            />
          )}
          {notesOpen && !aiTutorOpen && (
            <NotesPanel
              lessonId={lesson.id}
              open={notesOpen}
              onClose={() => setNotesOpen(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
