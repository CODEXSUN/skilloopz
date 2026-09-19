"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { usePageBuilderStore } from "@/stores/pageBuilderStore";
import { Play, Pause, Square, GripVertical, Timer } from "lucide-react";

type AnimationType = "none" | "fade-in" | "slide-up" | "scale" | "rotate";

interface AnimationSettings {
  type: AnimationType;
  duration: number;
  delay: number;
}

const ANIM_COLORS: Record<AnimationType, string> = {
  none: "#6B7280",
  "fade-in": "#6366F1",
  "slide-up": "#10B981",
  scale: "#F59E0B",
  rotate: "#EC4899",
};

const ANIM_COLORS_BG: Record<AnimationType, string> = {
  none: "",
  "fade-in": "bg-indigo-500",
  "slide-up": "bg-emerald-500",
  scale: "bg-amber-500",
  rotate: "bg-pink-500",
};

interface TimelineEntry {
  sectionId: string;
  blockType: string;
  label: string;
  anim: AnimationSettings | null;
  sortOrder: number;
}

function getAnimation(section: { settings?: Record<string, unknown> }): AnimationSettings | null {
  const raw = section.settings?.animation;
  if (raw && typeof raw === "object") {
    const a = raw as Record<string, unknown>;
    const entrance = a.entrance as Record<string, unknown> | undefined;
    if (entrance && entrance.type && (entrance.type as string) !== "none") {
      return {
        type: entrance.type as AnimationType,
        duration: (entrance.duration as number) ?? 0.6,
        delay: (entrance.delay as number) ?? 0,
      };
    }
  }
  return null;
}

export function AnimationTimeline({ open, onClose }: { open: boolean; onClose: () => void }) {
  const sections = usePageBuilderStore((s) => s.sections);
  const selectSection = usePageBuilderStore((s) => s.selectSection);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [dragId, setDragId] = useState<string | null>(null);
  const animRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const entries: TimelineEntry[] = sections
    .map((s) => ({
      sectionId: s.id,
      blockType: s.blockType,
      label: s.blockType,
      anim: getAnimation(s),
      sortOrder: s.sortOrder,
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const totalDuration = entries.reduce((max, e) => {
    if (!e.anim) return max;
    const end = e.anim.delay + e.anim.duration;
    return Math.max(max, end);
  }, 0);

  const stopPlayback = useCallback(() => {
    if (animRef.current !== null) cancelAnimationFrame(animRef.current);
    animRef.current = null;
    setPlaying(false);
    setCurrentTime(0);
  }, []);

  const startPlayback = useCallback(() => {
    startTimeRef.current = performance.now();
    setPlaying(true);
    setCurrentTime(0);

    function tick(now: number) {
      const elapsed = (now - startTimeRef.current) / 1000;
      setCurrentTime(elapsed);
      if (elapsed >= totalDuration + 0.5) {
        stopPlayback();
        return;
      }
      animRef.current = requestAnimationFrame(tick);
    }
    animRef.current = requestAnimationFrame(tick);
  }, [totalDuration, stopPlayback]);

  useEffect(() => {
    return () => {
      if (animRef.current !== null) cancelAnimationFrame(animRef.current);
    };
  }, []);

  function handleDragStart(e: React.DragEvent, id: string) {
    setDragId(id);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  function handleDrop(e: React.DragEvent, targetId: string) {
    e.preventDefault();
    if (!dragId || dragId === targetId) return;
    const reordered = [...sections];
    const fromIdx = reordered.findIndex((s) => s.id === dragId);
    const toIdx = reordered.findIndex((s) => s.id === targetId);
    if (fromIdx === -1 || toIdx === -1) return;
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    usePageBuilderStore
      .getState()
      .reorderSections(reordered.map((s, i) => ({ ...s, sortOrder: i })));
    setDragId(null);
  }

  const pxPerSecond = 200;
  const timelineWidth = Math.max(400, totalDuration * pxPerSecond + 100);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="fixed bottom-0 left-1/2 z-50 w-[90vw] max-w-4xl -translate-x-1/2 rounded-t-2xl border border-border bg-[rgba(11,13,16,0.98)] shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div className="flex items-center gap-3">
            <Timer className="h-4 w-4 text-primary-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
              Animation Timeline
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={startPlayback}
              disabled={playing || entries.length === 0}
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-glass hover:text-foreground disabled:opacity-30"
              title="Play"
            >
              <Play className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={stopPlayback}
              disabled={!playing}
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-glass hover:text-foreground disabled:opacity-30"
              title="Pause"
            >
              {playing ? <Pause className="h-3.5 w-3.5" /> : <Square className="h-3.5 w-3.5" />}
            </button>
            <div className="ml-2 text-[10px] font-mono text-muted-foreground">
              {currentTime.toFixed(1)}s / {totalDuration.toFixed(1)}s
            </div>
          </div>
        </div>

        <div className="overflow-x-auto p-5 custom-scrollbar">
          <div className="relative" style={{ width: timelineWidth }}>
            {/* time ruler */}
            <div className="sticky top-0 mb-2 flex h-5" style={{ width: timelineWidth }}>
              {Array.from({ length: Math.ceil(totalDuration) + 1 }, (_, i) => (
                <div
                  key={i}
                  className="absolute text-[9px] text-muted-foreground/40 font-mono"
                  style={{ left: i * pxPerSecond }}
                >
                  {i}s
                </div>
              ))}
              {/* playhead */}
              {playing && (
                <div
                  className="absolute top-0 h-full w-px bg-primary-400 shadow-[0_0_6px_rgba(99,102,241,0.5)] z-10 transition-all"
                  style={{ left: currentTime * pxPerSecond }}
                />
              )}
            </div>

            {/* entries */}
            <div className="space-y-1" style={{ width: timelineWidth }}>
              {entries.length === 0 && (
                <div className="flex items-center justify-center py-8">
                  <p className="text-xs text-muted-foreground">
                    No sections — add blocks with entrance animations to see them here.
                  </p>
                </div>
              )}
              {entries.map((entry) => (
                <div
                  key={entry.sectionId}
                  draggable
                  onDragStart={(e) => handleDragStart(e, entry.sectionId)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, entry.sectionId)}
                  onClick={() => selectSection(entry.sectionId)}
                  className="group flex h-8 cursor-pointer items-center gap-2 rounded-lg px-2 text-xs text-foreground transition-colors hover:bg-glass"
                >
                  <GripVertical className="h-3 w-3 shrink-0 text-muted-foreground/30" />
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-muted/30 text-[9px] font-bold uppercase text-muted-foreground">
                    {entry.blockType[0]}
                  </div>
                  <span className="w-20 shrink-0 text-[10px] font-medium text-muted-foreground">
                    {entry.label}
                  </span>
                  <div className="relative flex-1 h-5">
                    {entry.anim ? (
                      <div
                        className={`absolute top-1/2 h-2.5 -translate-y-1/2 rounded-full ${ANIM_COLORS_BG[entry.anim.type]} opacity-80 group-hover:opacity-100 transition-all`}
                        style={{
                          left: entry.anim.delay * pxPerSecond,
                          width: Math.max(entry.anim.duration * pxPerSecond, 12),
                        }}
                        title={`${entry.anim.type} (${entry.anim.duration}s, delay ${entry.anim.delay}s)`}
                      />
                    ) : (
                      <span className="text-[9px] text-muted-foreground/30 italic">
                        no animation
                      </span>
                    )}
                  </div>
                  {entry.anim && (
                    <span className="w-16 text-right text-[9px] font-mono text-muted-foreground/50">
                      {entry.anim.duration}s
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
