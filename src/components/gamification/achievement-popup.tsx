"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award } from "lucide-react";

interface AchievementPopupProps {
  name: string;
  description: string;
  xpReward: number;
  onComplete?: () => void;
}

export function AchievementPopup({ name, description, xpReward, onComplete }: AchievementPopupProps) {
  const [visible, setVisible] = useState(true);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setDone(true);
      onComplete?.();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (done) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.5, y: -60 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed left-1/2 top-[35%] z-50 -translate-x-1/2"
        >
          <div className="flex items-center gap-4 rounded-2xl border border-primary-500/30 bg-[rgba(0,0,0,0.85)] px-6 py-4 shadow-2xl shadow-primary-500/20 backdrop-blur-xl">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-500/20 text-primary-400">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-primary-400/80">
                Achievement Unlocked
              </p>
              <p className="font-heading text-lg font-bold text-foreground">
                {name}
              </p>
              <p className="text-xs text-muted-foreground">{description}</p>
              <p className="mt-1 text-xs font-medium text-yellow-400">+{xpReward} XP</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
