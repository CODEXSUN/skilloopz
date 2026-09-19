"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FileText, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NoteItem {
  id: string;
  content: string;
  lessonId: string;
  createdAt: string;
  updatedAt: string;
  lesson: {
    id: string;
    title: string;
    module: {
      courseId: string;
      course: { id: string; title: string };
    };
  };
}

export function DashboardNotesContent() {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notes")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setNotes(data.notes);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function deleteNote(id: string) {
    const res = await fetch(`/api/notes?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setNotes((prev) => prev.filter((n) => n.id !== id));
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
        <h1 className="text-2xl font-bold text-foreground">My Notes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Notes you&apos;ve taken across all lessons
        </p>
      </div>

      {notes.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-12 text-center">
          <FileText className="h-10 w-10 text-muted-foreground/30" />
          <h3 className="text-sm font-medium text-foreground">No notes yet</h3>
          <p className="text-xs text-muted-foreground/60">
            Open the notes panel in any lesson to start writing
          </p>
          <Link href="/courses">
            <Button size="sm" variant="outline" className="mt-2">
              Browse courses
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className="group rounded-xl border bg-card p-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <Link
                    href={`/lessons/${note.lessonId}`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    {note.lesson.title}
                  </Link>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {note.lesson.module.course.title}
                  </p>
                  <p className="mt-3 whitespace-pre-wrap text-sm text-foreground">
                    {note.content}
                  </p>
                </div>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="shrink-0 rounded-md p-1.5 text-muted-foreground/40 opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-3 text-[10px] text-muted-foreground/50">
                Updated {formatDate(note.updatedAt)}
              </p>
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
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}
