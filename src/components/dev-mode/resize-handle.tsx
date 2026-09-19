"use client";

import { useRef, useCallback } from "react";
import { motion } from "framer-motion";

type HandlePosition = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

interface ResizeHandleProps {
  rect: DOMRect;
  onResize: (width: number, height: number) => void;
}

const HANDLE_SIZE = 8;
const HANDLE_HIT = 12;

const POSITIONS: { key: HandlePosition; cx: number; cy: number; cursor: string }[] = [
  { key: "nw", cx: 0, cy: 0, cursor: "nwse-resize" },
  { key: "n", cx: 0.5, cy: 0, cursor: "ns-resize" },
  { key: "ne", cx: 1, cy: 0, cursor: "nesw-resize" },
  { key: "e", cx: 1, cy: 0.5, cursor: "ew-resize" },
  { key: "se", cx: 1, cy: 1, cursor: "nwse-resize" },
  { key: "s", cx: 0.5, cy: 1, cursor: "ns-resize" },
  { key: "sw", cx: 0, cy: 1, cursor: "nesw-resize" },
  { key: "w", cx: 0, cy: 0.5, cursor: "ew-resize" },
];

export function ResizeHandle({ rect, onResize }: ResizeHandleProps) {
  const startRef = useRef<{ x: number; y: number; w: number; h: number; pos: HandlePosition } | null>(null);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, pos: HandlePosition) => {
      e.preventDefault();
      e.stopPropagation();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      startRef.current = {
        x: e.clientX,
        y: e.clientY,
        w: rect.width,
        h: rect.height,
        pos,
      };

      const onMove = (ev: PointerEvent) => {
        if (!startRef.current) return;
        const { x, y, w, h, pos: p } = startRef.current;
        const dx = ev.clientX - x;
        const dy = ev.clientY - y;
        let newW = w;
        let newH = h;

        if (p.includes("e")) newW = Math.max(50, w + dx);
        if (p.includes("w")) newW = Math.max(50, w - dx);
        if (p.includes("s")) newH = Math.max(20, h + dy);
        if (p.includes("n")) newH = Math.max(20, h - dy);

        onResize(newW, newH);
      };

      const onUp = () => {
        startRef.current = null;
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerup", onUp);
      };

      document.addEventListener("pointermove", onMove);
      document.addEventListener("pointerup", onUp);
    },
    [rect, onResize],
  );

  return (
    <>
      {POSITIONS.map(({ key, cx, cy, cursor }) => (
        <motion.div
          key={key}
          style={{
            position: "fixed",
            left: rect.left + cx * rect.width - HANDLE_HIT / 2,
            top: rect.top + cy * rect.height - HANDLE_HIT / 2,
            width: HANDLE_HIT,
            height: HANDLE_HIT,
            zIndex: 10001,
            cursor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onPointerDown={(e) => handlePointerDown(e, key)}
          whileTap={{ scale: 1.3 }}
        >
          <div
            style={{
              width: HANDLE_SIZE,
              height: HANDLE_SIZE,
              borderRadius: "50%",
              backgroundColor: "rgb(79,124,255)",
              border: "2px solid white",
              boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
              pointerEvents: "none",
            }}
          />
        </motion.div>
      ))}
    </>
  );
}
