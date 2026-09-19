"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { PartyPopper, Sparkles, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WorldCompletionCelebrationProps {
  worldTitle: string;
  worldColor: string | null;
  islandCount: number;
  xpEarned: number;
  show: boolean;
}

function ConfettiPiece({ delay, color }: { delay: number; color: string }) {
  const size = Math.random() * 8 + 4;
  const x = Math.random() * window.innerWidth;
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: x, width: size, height: size * 1.5, backgroundColor: color, borderRadius: 2 }}
      initial={{ y: -20, rotate: 0, opacity: 1 }}
      animate={{
        y: window.innerHeight + 100,
        rotate: 720,
        opacity: 0,
      }}
      transition={{
        duration: 2.5 + Math.random() * 2,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    />
  );
}

export function WorldCompletionCelebration({
  worldTitle,
  worldColor,
  islandCount,
  xpEarned,
  show,
}: WorldCompletionCelebrationProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted || !show) return null;

  const colors = ["#ff6b6b", "#feca57", "#48dbfb", "#ff9ff3", "#54a0ff", "#5f27cd", "#01a3a4", "#f368e0"];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {Array.from({ length: 80 }).map((_, i) => (
          <ConfettiPiece key={i} delay={i * 0.02} color={colors[i % colors.length]} />
        ))}

        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.3 }}
          className="relative z-10 mx-4 max-w-md rounded-2xl border border-[rgba(255,255,255,0.1)] bg-black/90 p-8 text-center backdrop-blur-xl"
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Trophy className="mx-auto h-16 w-16 text-yellow-400" />
          </motion.div>

          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-4 text-2xl font-bold text-foreground"
          >
            World Mastered!
          </motion.h2>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-2 text-lg text-muted-foreground"
          >
            You conquered <span style={{ color: worldColor ?? "#3b82f6" }} className="font-semibold">{worldTitle}</span>
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="mt-6 flex justify-center gap-6"
          >
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{islandCount}</p>
              <p className="text-xs text-muted-foreground">Islands mastered</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-400">+{xpEarned}</p>
              <p className="text-xs text-muted-foreground">XP earned</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="mt-8 flex flex-col gap-3"
          >
            <Button asChild variant="default" className="w-full">
              <Link href="/worlds">
                <Sparkles className="mr-2 h-4 w-4" />
                Explore Next World
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard">
                <PartyPopper className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}