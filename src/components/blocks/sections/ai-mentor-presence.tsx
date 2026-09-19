"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Sparkles, Lightbulb } from "lucide-react";

const hints = [
  "Your learning style: visual-spatial",
  "Next optimal focus: Algebra II",
  "Retention peak in 45 minutes",
  "Try a quick challenge?",
  "You excel at pattern recognition",
];

export function AiMentorPresence() {
  const [hintIndex, setHintIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      setHintIndex((prev) => (prev + 1) % hints.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [visible]);

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed bottom-6 right-6 z-50 hidden lg:block pointer-events-auto"
    >
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="relative"
      >
        {/* Hint bubble */}
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-full right-0 mb-4 w-64"
          >
            <div className="glass-hero-panel rounded-[20px] p-5 shadow-xl">
              <div className="flex items-start gap-3">
                <Lightbulb className="h-4 w-4 text-accent-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-foreground mb-1">AI Insight</p>
                  <motion.p
                    key={hintIndex}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-[11px] text-muted-foreground/80 leading-relaxed"
                  >
                    {hints[hintIndex]}
                  </motion.p>
                  <motion.div
                    animate={{ opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="mt-3 flex items-center gap-1.5 text-[9px] text-primary-400/60"
                  >
                    <Sparkles className="h-2.5 w-2.5" />
                    <span>AI is analyzing your session</span>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Mentor avatar */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="group relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500/15 to-accent-500/10 border border-primary-500/20 shadow-lg hover:shadow-primary-500/20 transition-all duration-300 hover:scale-105 backdrop-blur-sm"
        >
          <div className="absolute inset-0 rounded-2xl bg-primary-400/5 blur-lg animate-pulse" />
          <motion.div
            animate={{ rotate: expanded ? 45 : 0, scale: expanded ? 1.1 : 1 }}
            transition={{ duration: 0.3 }}
          >
            <Sparkles className="h-6 w-6 text-primary-400 relative z-10" />
          </motion.div>

          {/* Online indicator */}
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 border-2 border-background z-20"
          />
        </button>
      </motion.div>
    </motion.div>
  );
}
