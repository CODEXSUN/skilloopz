"use client";

import { useCallback, useRef, useEffect, type ReactNode } from "react";
import type { BlockInteraction } from "@/lib/interaction-engine";
import { executeInteraction } from "@/lib/interaction-engine";

interface InteractionWrapperProps {
  interactions?: BlockInteraction;
  children: ReactNode;
}

export function InteractionWrapper({ interactions, children }: InteractionWrapperProps) {
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const observedRef = useRef<HTMLDivElement | null>(null);

  const handleClick = useCallback(() => {
    if (!interactions?.onClick) return;
    executeInteraction(interactions.onClick);
  }, [interactions]);

  const handleMouseEnter = useCallback(() => {
    if (!interactions?.onHover) return;
    const { action, delay } = interactions.onHover;
    if (delay) {
      hoverTimerRef.current = setTimeout(() => executeInteraction(action), delay);
    } else {
      executeInteraction(action);
    }
  }, [interactions]);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  }, []);

  const handleTouchStart = useCallback(() => {
    if (!interactions?.onHover) return;
    executeInteraction(interactions.onHover.action);
  }, [interactions]);

  useEffect(() => {
    if (!interactions?.onScrollIntoView || !observedRef.current) return;

    const { action, threshold } = interactions.onScrollIntoView;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            executeInteraction(action);
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: threshold ?? 0.3 }
    );

    observer.observe(observedRef.current);

    return () => observer.disconnect();
  }, [interactions]);

  return (
    <div
      ref={observedRef}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      className={interactions?.onClick ? "cursor-pointer" : undefined}
    >
      {children}
    </div>
  );
}
