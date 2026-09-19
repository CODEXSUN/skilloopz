"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface LessonNote {
  id: string;
  content: string;
  blockId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface NotesPanelProps {
  lessonId: string;
  open: boolean;
  onClose: () => void;
}

export function NotesPanel({ lessonId, open, onClose }: NotesPanelProps) {
  const [notes, setNotes] = useState<LessonNote[]>([]);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch(`/api/notes?lessonId=${lessonId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setNotes(data.notes);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [lessonId, open]);

  async function addNote() {
    if (!newNote.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, content: newNote }),
      });
      const data = await res.json();
      if (res.ok && data.note) {
        setNotes((prev) => [data.note, ...prev]);
        setNewNote("");
      }
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  }

  async function deleteNote(id: string) {
    const res = await fetch(`/api/notes?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setNotes((prev) => prev.filter((n) => n.id !== id));
    }
  }

  if (!open) return null;

  return (
    <div className="flex h-full flex-col border-l bg-background">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Notes</h3>
          {notes.length > 0 && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
              {notes.length}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : notes.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <FileText className="h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground/60">No notes yet</p>
            <p className="text-xs text-muted-foreground/40">Add your first note below</p>
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="group rounded-lg border bg-muted/30 p-3 transition-colors hover:bg-muted/50"
            >
              <p className="whitespace-pre-wrap text-sm text-foreground">{note.content}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground/50">
                  {formatDate(note.updatedAt)}
                </span>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="rounded p-1 text-muted-foreground/40 opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="border-t p-3">
        <Textarea
          ref={textareaRef}
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Write a note..."
          className="min-h-[80px] resize-none text-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              addNote();
            }
          }}
        />
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground/50">
            Ctrl+Enter to save
          </span>
          <Button
            size="sm"
            onClick={addNote}
            disabled={!newNote.trim() || saving}
            className="h-7 px-3 text-xs"
          >
            {saving ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <>
                <Plus className="mr-1 h-3 w-3" />
                Add note
              </>
            )}
          </Button>
        </div>
      </div>
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
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
