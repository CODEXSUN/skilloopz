"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

type CursorMode = "idle" | "open" | "press";

function getCursorMode(target: HTMLElement | null): CursorMode {
  const interactive = target?.closest("a, button");
  if (!interactive) return "idle";
  return interactive.tagName === "BUTTON" ? "press" : "open";
}

export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<CursorMode>("idle");
  const [pulseId, setPulseId] = useState(0);
  const pointerX = useMotionValue(-100);
  const pointerY = useMotionValue(-100);
  const orbitX = useSpring(pointerX, { damping: 25, stiffness: 250, mass: 0.42 });
  const orbitY = useSpring(pointerY, { damping: 25, stiffness: 250, mass: 0.42 });

  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)");
    const syncCapability = () => {
      setEnabled(finePointer.matches);
      document.documentElement.classList.toggle("has-custom-cursor", finePointer.matches);
    };
    const onPointerMove = (event: PointerEvent) => {
      pointerX.set(event.clientX);
      pointerY.set(event.clientY);
      setVisible(true);
      setMode(getCursorMode(event.target as HTMLElement | null));
    };
    const onPointerLeave = () => setVisible(false);
    const onPointerDown = () => setPulseId((current) => current + 1);

    syncCapability();
    finePointer.addEventListener("change", syncCapability);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onPointerLeave);
    window.addEventListener("pointerdown", onPointerDown, { passive: true });

    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      finePointer.removeEventListener("change", syncCapability);
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("mouseleave", onPointerLeave);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [pointerX, pointerY]);

  if (!enabled) return null;

  const isInteractive = mode !== "idle";
  const label = mode === "open" ? "OPEN" : mode === "press" ? "SELECT" : "";

  return (
    <>
      <motion.div style={{ x: orbitX, y: orbitY }} animate={{ opacity: visible ? 1 : 0 }} className="pointer-events-none fixed left-0 top-0 z-[100]">
        <motion.div animate={{ width: isInteractive ? 66 : 42, height: isInteractive ? 66 : 42, rotate: isInteractive ? 90 : 0 }} transition={{ type: "spring", damping: 18, stiffness: 240 }} className="relative -translate-x-1/2 -translate-y-1/2">
          <motion.svg animate={{ rotate: 360 }} transition={{ duration: 9, ease: "linear", repeat: Infinity }} viewBox="0 0 100 100" className="absolute inset-0 h-full w-full overflow-visible">
            <circle cx="50" cy="50" r="39" fill="none" stroke="rgba(221,183,255,.78)" strokeDasharray="30 14 4 12" strokeWidth="1.5" />
            <circle cx="50" cy="50" r="29" fill="none" stroke="rgba(120,102,255,.52)" strokeDasharray="4 16" strokeWidth="1" />
          </motion.svg>
          <motion.span animate={{ opacity: isInteractive ? 1 : 0, scale: isInteractive ? 1 : 0.7 }} transition={{ duration: 0.2 }} className="absolute inset-0 grid place-items-center text-[8px] font-semibold tracking-[.16em] text-white">{label}</motion.span>
        </motion.div>
      </motion.div>

      <motion.div style={{ x: pointerX, y: pointerY }} animate={{ opacity: visible ? 1 : 0 }} className="pointer-events-none fixed left-0 top-0 z-[101]">
        <span className="block h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_13px_rgba(255,255,255,.95),0_0_28px_rgba(217,70,239,.75)]" />
      </motion.div>

      <motion.span key={pulseId} initial={{ opacity: 0.72, scale: 0.35 }} animate={{ opacity: 0, scale: 2.8 }} transition={{ duration: 0.5, ease: "easeOut" }} style={{ x: pointerX, y: pointerY }} className="pointer-events-none fixed left-0 top-0 z-[99] block h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full border border-fuchsia-200/70" />
    </>
  );
}
