"use client";

import { useState, useEffect } from "react";
import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookmarkToggleProps {
  lessonId: string;
}

export function BookmarkToggle({ lessonId }: BookmarkToggleProps) {
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/bookmarks?lessonId=${lessonId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.bookmarks?.length > 0) setBookmarked(true);
      })
      .catch(() => {});
  }, [lessonId]);

  async function toggleBookmark() {
    setLoading(true);
    try {
      if (bookmarked) {
        const res = await fetch(`/api/bookmarks?lessonId=${lessonId}`, {
          method: "DELETE",
        });
        if (res.ok) setBookmarked(false);
      } else {
        const res = await fetch("/api/bookmarks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lessonId }),
        });
        if (res.ok) setBookmarked(true);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggleBookmark}
      disabled={loading}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-lg border transition-colors disabled:opacity-50",
        bookmarked
          ? "border-primary/30 bg-primary/10 text-primary hover:bg-primary/20"
          : "border-border text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
      title={bookmarked ? "Remove bookmark" : "Bookmark this lesson"}
    >
      <Bookmark className={cn("h-4 w-4", bookmarked && "fill-current")} />
    </button>
  );
}
