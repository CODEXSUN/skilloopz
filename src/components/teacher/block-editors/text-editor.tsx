"use client";

import { useState, useRef } from "react";
import { Bold, Italic, Heading, List, Eye, Edit3 } from "lucide-react";

import { cn } from "@/lib/utils";

interface TextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export function TextEditor({ content, onChange }: TextEditorProps) {
  const [preview, setPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function wrapSelection(before: string, after: string) {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);
    const newText = content.substring(0, start) + before + selected + after + content.substring(end);
    onChange(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 0);
  }

  function insertAtCursor(text: string) {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const newText = content.substring(0, start) + text + content.substring(textarea.selectionEnd);
    onChange(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => wrapSelection("**", "**")}
            title="Bold"
            className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => wrapSelection("_", "_")}
            title="Italic"
            className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Italic className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => insertAtCursor("## ")}
            title="Heading"
            className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Heading className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => insertAtCursor("- ")}
            title="List"
            className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
        <button
          type="button"
          onClick={() => setPreview((p) => !p)}
          className={cn(
            "flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors",
            preview
              ? "bg-primary-100 text-primary-700"
              : "text-muted-foreground hover:bg-muted",
          )}
        >
          {preview ? <Edit3 className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          {preview ? "Edit" : "Preview"}
        </button>
      </div>

      {preview ? (
        <div className="prose prose-sm max-w-none min-h-[160px] rounded-lg border border-border bg-white p-3">
          {content.split("\n").map((line, i) => {
            if (line.startsWith("## ")) {
              return <h2 key={i} className="text-lg font-semibold">{line.slice(3)}</h2>;
            }
            if (line.startsWith("### ")) {
              return <h3 key={i} className="text-base font-medium">{line.slice(4)}</h3>;
            }
            if (line.startsWith("- ")) {
              return <li key={i} className="ml-4 list-disc">{line.slice(2)}</li>;
            }
            if (line.startsWith("> ")) {
              return <blockquote key={i} className="border-l-4 border-border pl-3 italic">{line.slice(2)}</blockquote>;
            }
            if (line.trim() === "") {
              return <div key={i} className="h-3" />;
            }
            const rendered = line
              .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
              .replace(/_(.+?)_/g, "<em>$1</em>");
            return <p key={i} dangerouslySetInnerHTML={{ __html: rendered }} />;
          })}
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Write your content in markdown..."
          rows={8}
          className={cn(
            "min-h-[160px] w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground placeholder:text-tertiary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1",
          )}
        />
      )}
    </div>
  );
}

