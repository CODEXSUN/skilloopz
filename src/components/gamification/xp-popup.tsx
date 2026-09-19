"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap } from "lucide-react";

interface XpPopupProps {
  xp: number;
  reason?: string;
  onComplete?: () => void;
}

export function XpPopup({ xp, reason, onComplete }: XpPopupProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.5, y: -40 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed left-1/2 top-1/4 z-50 -translate-x-1/2"
        >
          <div className="flex items-center gap-3 rounded-2xl border border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.8)] px-6 py-4 shadow-2xl backdrop-blur-xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/20 text-yellow-400">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <p className="font-heading text-lg font-bold text-foreground">
                +{xp} XP
              </p>
              {reason && (
                <p className="text-xs text-muted-foreground">{reason}</p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
