"use client";

import { motion } from "framer-motion";
import { getLevelInfo } from "@/lib/gamification/xp-calculator";
import { getLevelTitle } from "@/lib/gamification/level-system";

interface LevelProgressProps {
  xp: number;
}

export function LevelProgress({ xp }: LevelProgressProps) {
  const info = getLevelInfo(xp);
  const title = getLevelTitle(info.level);

  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - info.progress);

  return (
    <div className="flex items-center gap-5">
      <div className="relative flex h-32 w-32 items-center justify-center">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 128 128">
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="8"
          />
          <motion.circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke="url(#levelGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          />
          <defs>
            <linearGradient id="levelGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-heading text-xs font-medium text-muted-foreground">Level</span>
          <span className="font-heading text-3xl font-bold text-foreground">{info.level}</span>
        </div>
      </div>

      <div className="space-y-1">
        <p className="font-heading text-sm font-bold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">
          {info.currentXp} / {info.nextLevelXp} XP
        </p>
        <div className="mt-1.5 flex h-1.5 w-36 overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
            initial={{ width: 0 }}
            animate={{ width: `${info.progress * 100}%` }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>
    </div>
  );
}
