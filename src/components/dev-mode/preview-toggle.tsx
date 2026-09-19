"use client";

import { useState } from "react";

interface PreviewToggleProps {
  pageId: string;
  pageSlug: string;
}

export function PreviewToggle({ pageSlug }: PreviewToggleProps) {
  const [loading, setLoading] = useState(false);

  async function handlePreview() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/pages/${pageSlug}/preview`, {
        method: "POST",
      });
      if (!res.ok) {
        console.error("Failed to create preview token");
        return;
      }
      const data = await res.json();
      window.open(data.url, "_blank");
    } catch (err) {
      console.error("Preview error", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handlePreview}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-xl border border-[rgba(255,255,255,0.08)] px-4 py-2 text-sm font-medium text-foreground transition-all hover:bg-[rgba(255,255,255,0.04)]"
    >
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
      {loading ? "Generating..." : "Preview"}
    </button>
  );
}

export function ExitPreview() {
  async function handleExit() {
    document.cookie = "preview_mode=; path=/; max-age=0";
    window.location.reload();
  }

  return (
    <button
      onClick={handleExit}
      className="inline-flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-400 transition-all hover:bg-amber-500/20"
    >
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
      Exit Preview
    </button>
  );
}
