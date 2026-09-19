"use client";

import { useState } from "react";
import { Copy, Trash2, FileIcon, Loader2, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MediaRecord {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  alt: string | null;
  createdAt: string;
  uploadedBy: { id: string; fullName: string | null };
}

interface MediaGridProps {
  items: MediaRecord[];
  onDeleted: (id: string) => void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "🖼";
  if (mimeType.startsWith("video/")) return "🎬";
  if (mimeType.startsWith("audio/")) return "🎵";
  if (mimeType.includes("pdf")) return "📄";
  return "📁";
}

export function MediaGrid({ items, onDeleted }: MediaGridProps) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function handleCopy(url: string, id: string) {
    try {
      await navigator.clipboard.writeText(window.location.origin + url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // fallback
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this file?")) return;
    setDeleting(id);
    try {
      await fetch(`/api/admin/media/${id}`, { method: "DELETE" });
      onDeleted(id);
    } catch {
      alert("Failed to delete");
    } finally {
      setDeleting(null);
    }
  }

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-tertiary-foreground">
        No media files yet. Upload one above.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {items.map((item) => (
        <div
          key={item.id}
          className="group relative overflow-hidden rounded-lg border border-border transition-shadow hover:shadow-md"
        >
          <div className="flex aspect-square items-center justify-center bg-muted">
            {item.mimeType.startsWith("image/") ? (
              <img
                src={item.url}
                alt={item.alt ?? item.originalName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-1 text-center">
                <span className="text-3xl">{getFileIcon(item.mimeType)}</span>
                <span className="max-w-[120px] truncate px-2 text-xs text-muted-foreground">
                  {item.originalName}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-1 p-2">
            <p className="truncate text-xs font-medium text-foreground">
              {item.originalName}
            </p>
            <p className="text-[10px] text-tertiary-foreground">{formatSize(item.sizeBytes)}</p>
          </div>

          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center gap-1 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100",
            )}
          >
            <Button
              variant="secondary"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => handleCopy(item.url, item.id)}
            >
              {copiedId === item.id ? (
                <Check className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
              {copiedId === item.id ? "Copied!" : "Copy URL"}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="h-7 px-2"
              disabled={deleting === item.id}
              onClick={() => handleDelete(item.id)}
            >
              {deleting === item.id ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Trash2 className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
