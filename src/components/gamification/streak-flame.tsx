"use client";

import { motion } from "framer-motion";
import { Flame } from "lucide-react";

interface StreakFlameProps {
  streak: number;
}

export function StreakFlame({ streak }: StreakFlameProps) {
  const color =
    streak === 0
      ? "text-gray-500"
      : streak <= 6
        ? "text-orange-400"
        : "text-red-500";

  return (
    <motion.div
      className="flex items-center gap-1"
      aria-label="Current learning streak"
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <Flame
        className={`h-5 w-5 ${color} ${streak > 0 ? "drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]" : ""}`}
      />
      <span className={`text-sm font-bold ${color}`}>{streak}</span>
    </motion.div>
  );
}
