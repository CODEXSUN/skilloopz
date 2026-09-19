"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface AlignGuide {
  orientation: "horizontal" | "vertical";
  position: number;
  start: number;
  end: number;
}

interface AlignmentGuidesProps {
  containerRef: React.RefObject<HTMLElement | null>;
  activeBlockId?: string;
}

const SNAP_THRESHOLD = 10;

export function AlignmentGuides({ containerRef, activeBlockId }: AlignmentGuidesProps) {
  const [guides, setGuides] = useState<AlignGuide[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);
  const rafRef = useRef<number>(0);

  const computeGuides = useCallback(() => {
    if (!activeBlockId || !containerRef.current) {
      setGuides([]);
      return;
    }

    const container = containerRef.current;
    const activeEl = container.querySelector(`[data-block-id="${activeBlockId}"]`) as HTMLElement | null;
    if (!activeEl) {
      setGuides([]);
      return;
    }

    const activeRect = activeEl.getBoundingClientRect();
    const siblingBlockEls = container.querySelectorAll<HTMLElement>("[data-block-id]");

    const foundGuides: AlignGuide[] = [];

    for (const el of siblingBlockEls) {
      const id = el.getAttribute("data-block-id");
      if (id === activeBlockId) continue;

      const rect = el.getBoundingClientRect();

      const left = rect.left;
      const top = rect.top;
      const right = rect.right;
      const bottom = rect.bottom;

      const aLeft = activeRect.left;
      const aTop = activeRect.top;
      const aRight = activeRect.right;
      const aBottom = activeRect.bottom;

      const aHCenter = (aLeft + aRight) / 2;
      const aVCenter = (aTop + aBottom) / 2;
      const hCenter = (left + right) / 2;
      const vCenter = (top + bottom) / 2;

      if (Math.abs(aLeft - left) < SNAP_THRESHOLD) {
        foundGuides.push({
          orientation: "vertical",
          position: aLeft,
          start: Math.min(top, aTop),
          end: Math.max(bottom, aBottom),
        });
      }
      if (Math.abs(aRight - right) < SNAP_THRESHOLD) {
        foundGuides.push({
          orientation: "vertical",
          position: aRight,
          start: Math.min(top, aTop),
          end: Math.max(bottom, aBottom),
        });
      }
      if (Math.abs(aHCenter - hCenter) < SNAP_THRESHOLD) {
        foundGuides.push({
          orientation: "vertical",
          position: aHCenter,
          start: Math.min(top, aTop),
          end: Math.max(bottom, aBottom),
        });
      }
      if (Math.abs(aTop - top) < SNAP_THRESHOLD) {
        foundGuides.push({
          orientation: "horizontal",
          position: aTop,
          start: Math.min(left, aLeft),
          end: Math.max(right, aRight),
        });
      }
      if (Math.abs(aBottom - bottom) < SNAP_THRESHOLD) {
        foundGuides.push({
          orientation: "horizontal",
          position: aBottom,
          start: Math.min(left, aLeft),
          end: Math.max(right, aRight),
        });
      }
      if (Math.abs(aVCenter - vCenter) < SNAP_THRESHOLD) {
        foundGuides.push({
          orientation: "horizontal",
          position: aVCenter,
          start: Math.min(left, aLeft),
          end: Math.max(right, aRight),
        });
      }
    }

    setGuides(foundGuides);
  }, [activeBlockId, containerRef]);

  useEffect(() => {
    if (!activeBlockId) {
      queueMicrotask(() => setGuides([]));
      return;
    }

    queueMicrotask(computeGuides);

    const handleScrollOrResize = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(computeGuides);
    };

    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    const observer = new ResizeObserver(handleScrollOrResize);
    if (containerRef.current) observer.observe(containerRef.current);

    const interval = setInterval(computeGuides, 200);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
      observer.disconnect();
      clearInterval(interval);
    };
  }, [activeBlockId, containerRef, computeGuides]);

  if (guides.length === 0) return null;

  return (
    <svg
      ref={svgRef}
      className="pointer-events-none fixed inset-0 z-[9999] h-full w-full"
    >
      {guides.map((guide, i) =>
        guide.orientation === "vertical" ? (
          <line
            key={`v-${i}`}
            x1={guide.position}
            y1={guide.start}
            x2={guide.position}
            y2={guide.end}
            stroke="#4F7CFF"
            strokeWidth={1}
            strokeDasharray="4 3"
            opacity={0.8}
          />
        ) : (
          <line
            key={`h-${i}`}
            x1={guide.start}
            y1={guide.position}
            x2={guide.end}
            y2={guide.position}
            stroke="#4F7CFF"
            strokeWidth={1}
            strokeDasharray="4 3"
            opacity={0.8}
          />
        ),
      )}
    </svg>
  );
}
