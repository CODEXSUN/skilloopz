"use client";

import { useMemo } from "react";
import { BarChart3, X, Layers, FileText, Hash } from "lucide-react";
import { usePageBuilderStore } from "@/stores/pageBuilderStore";

interface PerformanceInspectorPanelProps {
  open: boolean;
  onClose: () => void;
}

function bytes(str: string): number {
  return new TextEncoder().encode(str).length;
}

export function PerformanceInspectorPanel({ open, onClose }: PerformanceInspectorPanelProps) {
  const sections = usePageBuilderStore((s) => s.sections);

  const stats = useMemo(() => {
    const totalSections = sections.length;
    let totalContentSize = 0;
    let totalSettingsSize = 0;

    const typeCount: Record<string, number> = {};
    const typeContentSize: Record<string, number> = {};

    for (const section of sections) {
      const contentStr = JSON.stringify(section.content ?? {});
      const settingsStr = JSON.stringify(section.settings ?? {});
      const cSize = bytes(contentStr);
      const sSize = bytes(settingsStr);

      totalContentSize += cSize;
      totalSettingsSize += sSize;

      typeCount[section.blockType] = (typeCount[section.blockType] ?? 0) + 1;
      typeContentSize[section.blockType] = (typeContentSize[section.blockType] ?? 0) + cSize;
    }

    const sortedTypes = Object.entries(typeCount).sort((a, b) => b[1] - a[1]);
    const maxCount = sortedTypes.length > 0 ? sortedTypes[0][1] : 1;

    return {
      totalSections,
      totalContentSize,
      totalSettingsSize,
      totalSize: totalContentSize + totalSettingsSize,
      sortedTypes,
      maxCount,
      typeContentSize,
    };
  }, [sections]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2">
        <div className="max-h-[70vh] overflow-y-auto rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(11,13,16,0.98)] p-6 shadow-xl backdrop-blur-xl custom-scrollbar">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500/10">
                <BarChart3 className="h-5 w-5 text-primary-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Performance Inspector</h3>
                <p className="text-xs text-muted-foreground">Page composition and size analysis</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-glass transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Summary cards */}
          <div className="mb-4 grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-3">
              <div className="mb-1 flex items-center gap-1.5 text-muted-foreground">
                <Layers className="h-3 w-3" />
                <span className="text-[9px] font-semibold uppercase tracking-wider">Sections</span>
              </div>
              <p className="text-xl font-bold text-foreground">{stats.totalSections}</p>
            </div>
            <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-3">
              <div className="mb-1 flex items-center gap-1.5 text-muted-foreground">
                <FileText className="h-3 w-3" />
                <span className="text-[9px] font-semibold uppercase tracking-wider">Content</span>
              </div>
              <p className="text-xl font-bold text-foreground">{formatSize(stats.totalContentSize)}</p>
            </div>
            <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-3">
              <div className="mb-1 flex items-center gap-1.5 text-muted-foreground">
                <Hash className="h-3 w-3" />
                <span className="text-[9px] font-semibold uppercase tracking-wider">Total</span>
              </div>
              <p className="text-xl font-bold text-foreground">{formatSize(stats.totalSize)}</p>
            </div>
          </div>

          {/* Block type distribution */}
          {stats.sortedTypes.length > 0 && (
            <div>
              <h4 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                Block Type Distribution
              </h4>
              <div className="space-y-2">
                {stats.sortedTypes.map(([type, count]) => {
                  const pct = Math.round((count / stats.maxCount) * 100);
                  const typeSize = stats.typeContentSize[type] ?? 0;
                  return (
                    <div key={type} className="group rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] px-3 py-2">
                      <div className="mb-1.5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-foreground">{type}</span>
                          <span className="rounded-full bg-primary-500/10 px-1.5 py-0.5 text-[9px] font-medium text-primary-400">
                            {count}x
                          </span>
                        </div>
                        <span className="text-[9px] text-muted-foreground/60">{formatSize(typeSize)}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted/20">
                        <div
                          className="h-full rounded-full bg-primary-500/60 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {stats.totalSections === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BarChart3 className="mb-2 h-8 w-8 text-muted-foreground/30" />
              <p className="text-xs text-muted-foreground">No sections on this page</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function formatSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
