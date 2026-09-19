"use client";

import { useState, useEffect } from "react";
import { BookOpen, Download, Trash2, Clock } from "lucide-react";

import { offlineDB, type OfflineLesson } from "@/lib/offline-db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface OfflineLessonsProps {
  courseId?: string;
  onOpenLesson?: (lesson: OfflineLesson) => void;
}

export function OfflineLessons({ courseId, onOpenLesson }: OfflineLessonsProps) {
  const [lessons, setLessons] = useState<OfflineLesson[]>([]);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    if (courseId) {
      offlineDB.getLessonsByCourse(courseId).then(setLessons);
    }
  }, [courseId]);

  async function handleCacheLesson(lesson: OfflineLesson) {
    setDownloading(lesson.id);
    try {
      const res = await fetch(`/api/lessons/${lesson.id}`);
      if (!res.ok) return;

      const data = await res.json();
      await offlineDB.cacheLesson({
        id: lesson.id,
        courseId: lesson.courseId,
        title: data.lesson?.title ?? lesson.title,
        content: JSON.stringify(data.lesson?.content ?? {}),
        cachedAt: Date.now(),
      });

      if (courseId) {
        const updated = await offlineDB.getLessonsByCourse(courseId);
        setLessons(updated);
      }
    } finally {
      setDownloading(null);
    }
  }

  async function handleRemoveLesson(id: string) {
    await offlineDB.deleteLesson(id);
    if (courseId) {
      const updated = await offlineDB.getLessonsByCourse(courseId);
      setLessons(updated);
    }
  }

  function formatCachedAt(timestamp: number): string {
    const diff = Date.now() - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Download className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-medium text-foreground">Offline Lessons</h3>
        <Badge variant="outline" className="text-xs">{lessons.length} cached</Badge>
      </div>

      {lessons.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          No lessons cached. Click the download icon on any lesson to save it for offline access.
        </p>
      ) : (
        <div className="space-y-2">
          {lessons.map((lesson) => (
            <Card key={lesson.id} size="sm">
              <CardContent className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3 min-w-0">
                  <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{lesson.title}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Cached {formatCachedAt(lesson.cachedAt)}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  {onOpenLesson && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onOpenLesson(lesson)}
                    >
                      Open
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveLesson(lesson.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
