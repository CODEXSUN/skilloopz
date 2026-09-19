"use client";

import { useState, useEffect, useCallback } from "react";
import { LayoutTemplate, Trash2, Plus, Loader2, Layers, X } from "lucide-react";
import { usePageBuilderStore, type PageSection, type SectionType } from "@/stores/pageBuilderStore";

interface ReusableBlockData {
  id: string;
  name: string;
  description: string | null;
  blockType: string;
  content: string;
  settings: string;
  category: string;
  createdAt: string;
}

interface ReusableBlocksPanelProps {
  open: boolean;
  onClose: () => void;
}

export function ReusableBlocksPanel({ open, onClose }: ReusableBlocksPanelProps) {
  const [blocks, setBlocks] = useState<ReusableBlockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const addSection = usePageBuilderStore((s) => s.addSection);
  const sections = usePageBuilderStore((s) => s.sections);

  const fetchBlocks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/reusable-blocks");
      if (!res.ok) throw new Error("Failed to load reusable blocks");
      setBlocks(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) fetchBlocks();
  }, [open, fetchBlocks]);

  function handleInsert(block: ReusableBlockData) {
    const newSection: PageSection = {
      id: crypto.randomUUID(),
      pageId: "current",
      blockType: block.blockType as SectionType,
      sortOrder: sections.length,
      content: JSON.parse(block.content),
      settings: JSON.parse(block.settings),
    };
    addSection(newSection);
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/admin/reusable-blocks/${id}`, { method: "DELETE" });
    if (res.ok) {
      setBlocks((prev) => prev.filter((b) => b.id !== id));
    }
  }

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2">
        <div className="max-h-[70vh] overflow-y-auto rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(11,13,16,0.98)] p-6 shadow-xl backdrop-blur-xl custom-scrollbar">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500/10">
                <Layers className="h-5 w-5 text-primary-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Reusable Blocks</h3>
                <p className="text-xs text-muted-foreground">
                  Save and reuse blocks across pages.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-glass transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="rounded-lg bg-red-500/5 px-4 py-3 text-xs text-red-400">{error}</div>
          ) : blocks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <LayoutTemplate className="mb-2 h-8 w-8 text-muted-foreground/30" />
              <p className="text-xs text-muted-foreground">No reusable blocks yet. Save a block from the Properties panel.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {blocks.map((block) => (
                <div
                  key={block.id}
                  className="group rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-4 transition-all hover:border-primary-500/30 hover:bg-primary-500/5"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">{block.name}</p>
                      <span className="inline-flex items-center rounded-full bg-primary-500/10 px-1.5 py-0.5 text-[9px] font-medium text-primary-400">
                        {block.blockType}
                      </span>
                    </div>
                    <div className="ml-2 hidden gap-1 group-hover:flex">
                      <button
                        onClick={() => handleInsert(block)}
                        className="rounded-lg bg-primary-500 p-1.5 text-white hover:bg-primary-400 transition-colors"
                        title="Insert block"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(block.id)}
                        className="rounded-lg p-1.5 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  {block.description && (
                    <p className="text-[10px] text-muted-foreground/60 line-clamp-2">{block.description}</p>
                  )}
                  <p className="mt-1 text-[9px] text-muted-foreground/40">
                    Saved {new Date(block.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
