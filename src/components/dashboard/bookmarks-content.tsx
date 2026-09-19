"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bookmark, Trash2, Loader2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BookmarkItem {
  id: string;
  lessonId: string;
  createdAt: string;
  lesson: {
    id: string;
    title: string;
    module: {
      courseId: string;
      course: { id: string; title: string; thumbnailUrl: string | null };
    };
  };
}

export function DashboardBookmarksContent() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/bookmarks")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setBookmarks(data.bookmarks);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function removeBookmark(id: string, lessonId: string) {
    const res = await fetch(`/api/bookmarks?lessonId=${lessonId}`, { method: "DELETE" });
    if (res.ok) {
      setBookmarks((prev) => prev.filter((b) => b.id !== id));
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Bookmarks</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Lessons you&apos;ve saved for quick access
        </p>
      </div>

      {bookmarks.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-12 text-center">
          <Bookmark className="h-10 w-10 text-muted-foreground/30" />
          <h3 className="text-sm font-medium text-foreground">No bookmarks yet</h3>
          <p className="text-xs text-muted-foreground/60">
            Bookmark lessons from the player to find them here
          </p>
          <Link href="/courses">
            <Button size="sm" variant="outline" className="mt-2">
              Browse courses
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {bookmarks.map((b) => (
            <div
              key={b.id}
              className="group relative overflow-hidden rounded-xl border bg-card transition-colors hover:bg-muted/50"
            >
              <Link href={`/lessons/${b.lessonId}`} className="block p-4">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <h3 className="line-clamp-2 text-sm font-medium text-foreground">
                  {b.lesson.title}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {b.lesson.module.course.title}
                </p>
                <p className="mt-2 text-[10px] text-muted-foreground/50">
                  Bookmarked {formatDate(b.createdAt)}
                </p>
              </Link>
              <button
                onClick={() => removeBookmark(b.id, b.lessonId)}
                className="absolute right-2 top-2 rounded-md p-1.5 text-muted-foreground/40 opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}
