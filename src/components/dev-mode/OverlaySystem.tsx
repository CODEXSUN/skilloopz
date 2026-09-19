"use client";

import { type ReactNode, useEffect, useRef, useState, useCallback } from "react";
import { useDevModeStore } from "@/stores/devModeStore";
import { BlockOverlay } from "./BlockOverlay";

interface OverlaySystemProps {
  children: ReactNode;
}

const DEVICE_LABELS: Record<string, string> = {
  desktop: "Desktop (1025px+)",
  tablet: "Tablet (768\u20131024px)",
  mobile: "Mobile (320\u2013767px)",
};

export function OverlaySystem({ children }: OverlaySystemProps) {
  const enabled = useDevModeStore((s) => s.enabled);
  const selectedId = useDevModeStore((s) => s.selectedId);
  const deviceMode = useDevModeStore((s) => s.deviceMode);
  const setHovered = useDevModeStore((s) => s.setHovered);
  const select = useDevModeStore((s) => s.select);

  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedRect, setSelectedRect] = useState<DOMRect | null>(null);

  const refreshRects = useCallback(() => {
    const sid = useDevModeStore.getState().selectedId;
    if (sid) {
      const el = containerRef.current?.querySelector(`[data-block-id="${sid}"]`);
      setSelectedRect(el ? el.getBoundingClientRect() : null);
    } else {
      setSelectedRect(null);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    refreshRects();
    const observer = new ResizeObserver(refreshRects);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    const interval = setInterval(refreshRects, 500);
    const handleScroll = () => refreshRects();
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      observer.disconnect();
      clearInterval(interval);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [enabled, refreshRects]);

  const handleMouseOver = useCallback((e: React.MouseEvent) => {
    const el = (e.target as HTMLElement).closest("[data-block-id]");
    if (el) {
      const id = el.getAttribute("data-block-id");
      if (id) setHovered(id);
    }
  }, [setHovered]);

  const handleMouseLeave = useCallback(() => {
    setHovered(null);
  }, [setHovered]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    const el = (e.target as HTMLElement).closest("[data-block-id]");
    if (el) {
      const id = el.getAttribute("data-block-id");
      if (id) select(id);
    }
  }, [select]);

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseOver={handleMouseOver}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {children}

      {selectedId && selectedRect && (
        <div
          className="pointer-events-none fixed z-[9999] flex items-center gap-1 rounded-full bg-background/80 px-2 py-0.5 text-[9px] font-bold text-foreground/60 shadow-sm backdrop-blur-md border border-glass-border"
          style={{
            left: selectedRect.left,
            top: selectedRect.bottom + 4,
          }}
        >
          <span>{Math.round(selectedRect.width)} &times; {Math.round(selectedRect.height)}</span>
          <span className="mx-0.5 text-foreground/20">|</span>
          <span>({Math.round(selectedRect.left)}, {Math.round(selectedRect.top)})</span>
        </div>
      )}

      <div className="pointer-events-none fixed bottom-4 right-4 z-[9999] rounded-full bg-background/80 px-3 py-1.5 text-[10px] font-bold text-foreground/60 shadow-sm backdrop-blur-md border border-glass-border">
        {DEVICE_LABELS[deviceMode]}
      </div>
    </div>
  );
}

export { BlockOverlay };
