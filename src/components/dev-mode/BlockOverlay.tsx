"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { ChevronUp, ChevronDown, Trash2 } from "lucide-react";
import { useDevModeStore } from "@/stores/devModeStore";
import { usePageBuilderStore } from "@/stores/pageBuilderStore";
import { ResizeHandle } from "./resize-handle";

interface BlockOverlayProps {
  blockId: string;
  type: string;
  label: string;
  path: string;
  children: React.ReactNode;
}

export function BlockOverlay({ blockId, label, path, children }: Omit<BlockOverlayProps, "type">) {
  const ref = useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const enabled = useDevModeStore((s) => s.enabled);
  const hoveredId = useDevModeStore((s) => s.hoveredId);
  const selectedId = useDevModeStore((s) => s.selectedId);
  const setHovered = useDevModeStore((s) => s.setHovered);
  const select = useDevModeStore((s) => s.select);
  const showLabels = useDevModeStore((s) => s.showLabels);
  const showGuides = useDevModeStore((s) => s.showGuides);

  const isHovered = hoveredId === blockId;
  const isSelected = selectedId === blockId;

  useEffect(() => {
    if (!enabled || !ref.current) return;

    const updateRect = () => {
      if (ref.current) {
        setRect(ref.current.getBoundingClientRect());
      }
    };

    updateRect();

    const observer = new ResizeObserver(updateRect);
    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [enabled, children]);

  const handleResize = useCallback(
    (width: number, height: number) => {
      const section = usePageBuilderStore.getState().sections.find((s) => s.id === blockId);
      if (!section) return;
      usePageBuilderStore.getState().updateSection(blockId, {
        settings: {
          ...section.settings,
          styles: {
            ...(section.settings.styles ?? {}),
            width: `${Math.round(width)}px`,
            height: `${Math.round(height)}px`,
          },
        },
      });
    },
    [blockId],
  );

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div
        ref={ref}
        data-block-id={blockId}
        className={`relative transition-all duration-150 ${
          isHovered && !isSelected ? "ring-2 ring-primary-500/50" : ""
        } ${isSelected ? "ring-2 ring-primary-500 shadow-glow-sm" : ""}`}
        onMouseEnter={() => setHovered(blockId)}
        onMouseLeave={() => setHovered(null)}
        onClick={(e) => {
          e.stopPropagation();
          select(blockId);
          usePageBuilderStore.getState().selectSection(blockId);
        }}
      >
        {children}
      </div>

      {isSelected && rect && (
        <div
          className="fixed z-[9999]"
          style={{
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height,
            pointerEvents: "none"
          }}
        >
          <div className="absolute inset-0 border-2 border-primary-500 rounded-[inherit] shadow-[0_0_0_1px_rgba(79,124,255,0.2)]" />

          <div 
            className="absolute -top-8 left-0 flex items-center gap-2 rounded-lg bg-primary-500 p-1 text-[10px] font-bold text-white shadow-[0_8px_16px_rgba(0,0,0,0.2)]"
            style={{ pointerEvents: "auto" }}
          >
            <div className="flex items-center gap-1.5 px-2">
              <span className="opacity-60">{path}</span>
              <span className="h-1 w-1 rounded-full bg-white/40" />
              <span>{label}</span>
            </div>
            
            <div className="flex items-center gap-0.5 rounded-md bg-white/10 p-0.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const sections = usePageBuilderStore.getState().sections;
                  const idx = sections.findIndex((s) => s.id === blockId);
                  if (idx > 0) {
                    const newSections = [...sections];
                    [newSections[idx - 1], newSections[idx]] = [newSections[idx], newSections[idx - 1]];
                    usePageBuilderStore.getState().reorderSections(newSections);
                  }
                }}
                className="rounded p-1 transition-colors hover:bg-white/20"
              >
                <ChevronUp className="h-3 w-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const sections = usePageBuilderStore.getState().sections;
                  const idx = sections.findIndex((s) => s.id === blockId);
                  if (idx < sections.length - 1) {
                    const newSections = [...sections];
                    [newSections[idx], newSections[idx + 1]] = [newSections[idx + 1], newSections[idx]];
                    usePageBuilderStore.getState().reorderSections(newSections);
                  }
                }}
                className="rounded p-1 transition-colors hover:bg-white/20"
              >
                <ChevronDown className="h-3 w-3" />
              </button>
              <div className="mx-1 h-3 w-px bg-white/20" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  usePageBuilderStore.getState().removeSection(blockId);
                  useDevModeStore.getState().select(null);
                }}
                className="rounded p-1 transition-colors hover:bg-red-500/40 hover:text-white"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>

          <div className="absolute -bottom-6 right-0 rounded-full bg-background/80 px-2 py-0.5 text-[9px] font-bold text-foreground/60 shadow-sm backdrop-blur-md border border-glass-border">
            {Math.round(rect.width)} × {Math.round(rect.height)}
          </div>

          {/* Resize handles */}
          <ResizeHandle rect={rect} onResize={handleResize} />
        </div>
      )}

      {isHovered && !isSelected && rect && showLabels && (
        <div
          className="pointer-events-none fixed z-[9998]"
          style={{
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height,
          }}
        >
          <div className="absolute -top-5 left-0 rounded-t-md bg-primary-500/80 px-1.5 py-0.5 text-[10px] text-white">
            {label}
          </div>
        </div>
      )}

      {isSelected && showGuides && rect && (
        <>
          <div
            className="pointer-events-none fixed z-[9997] border-l border-dashed border-primary-400/30"
            style={{ left: rect.left, top: 0, height: rect.top }}
          />
          <div
            className="pointer-events-none fixed z-[9997] border-l border-dashed border-primary-400/30"
            style={{ left: rect.left, top: rect.bottom, height: `calc(100vh - ${rect.bottom}px)` }}
          />
          <div
            className="pointer-events-none fixed z-[9997] border-t border-dashed border-primary-400/30"
            style={{ top: rect.top, left: 0, width: rect.left }}
          />
          <div
            className="pointer-events-none fixed z-[9997] border-t border-dashed border-primary-400/30"
            style={{ top: rect.top, left: rect.right, width: `calc(100vw - ${rect.right}px)` }}
          />
        </>
      )}
    </div>
  );
}
