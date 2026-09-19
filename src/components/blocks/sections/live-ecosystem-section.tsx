"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { Users, Activity, Brain, Zap, TrendingUp, Clock } from "lucide-react";

function useCountUp(target: number, duration = 2000) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!ref.current || started) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
          const startTime = performance.now();
          function tick(now: number) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration, started]);

  return [value, ref] as const;
}

const activities = [
  { user: "Alex K.", action: "mastered", concept: "Calculus II", time: "now", type: "mastery" },
  { user: "Maria S.", action: "started", concept: "React Patterns", time: "12s ago", type: "start" },
  { user: "James W.", action: "adapted to", concept: "French Level 4", time: "28s ago", type: "adapt" },
  { user: "Priya R.", action: "achieved", concept: "100-day streak", time: "47s ago", type: "streak" },
  { user: "Tom L.", action: "unlocked", concept: "ML Specialist", time: "1m ago", type: "unlock" },
  { user: "Zara M.", action: "answered", concept: "50 challenges", time: "1m ago", type: "mastery" },
];

const AIAdjustments = [
  "Difficulty recalibrated for 842 learners",
  "New path generated for Physics 201",
  "Spaced repetition schedule optimized",
  "Knowledge gaps detected — bridging 156 concepts",
  "Content pace adapted for 340 active sessions",
];

export function LiveEcosystemSection() {
  const [activeLearners, activeLearnersRef] = useCountUp(1247);
  const [conceptsToday, conceptsTodayRef] = useCountUp(3891);
  const [avgRetention, avgRetentionRef] = useCountUp(94);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative overflow-hidden px-6 py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/3 h-[500px] w-[500px] rounded-full bg-emerald-200/6 dark:bg-emerald-500/3 blur-[140px] animate-ambient-float" />
        <div className="absolute right-1/3 bottom-1/4 h-[400px] w-[400px] rounded-full bg-cyan-200/5 dark:bg-cyan-500/3 blur-[100px] animate-ambient-float" style={{ animationDelay: "-6s" }} />
      </div>

      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16 text-center"
        >
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-primary-400">
            Live Learning Ecosystem
          </p>
          <h2 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl text-foreground">
            A living, breathing intelligence
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-sm leading-relaxed text-muted-foreground/70">
            Every interaction shapes the system — AI adjusts, adapts, and evolves in real-time
          </p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left column — Live metrics */}
          <div className="space-y-4">
            <div className="glass-hero-panel rounded-[20px] p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500/10">
                  <Users className="h-4 w-4 text-primary-400" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60">Active Now</span>
              </div>
              <span ref={activeLearnersRef} className="font-heading text-4xl font-bold text-foreground tracking-tight">
                {activeLearners}
              </span>
              <div className="mt-2 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-emerald-400/70 font-medium">Live</span>
              </div>
            </div>

            <div className="glass-hero-panel rounded-[20px] p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-500/10">
                  <TrendingUp className="h-4 w-4 text-accent-400" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60">Concepts Today</span>
              </div>
              <span ref={conceptsTodayRef} className="font-heading text-4xl font-bold text-foreground tracking-tight">
                {conceptsToday}
              </span>
            </div>

            <div className="glass-hero-panel rounded-[20px] p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                  <Brain className="h-4 w-4 text-emerald-400" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60">Avg Retention</span>
              </div>
              <span ref={avgRetentionRef} className="font-heading text-4xl font-bold text-foreground tracking-tight">
                {avgRetention}%
              </span>
            </div>
          </div>

          {/* Middle column — Activity feed */}
          <div className="lg:col-span-2">
            <div className="glass-hero-panel rounded-[20px] p-6 h-full">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500/10">
                    <Activity className="h-4 w-4 text-primary-400" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60">
                    Live Activity Feed
                  </span>
                </div>
                <span className="flex items-center gap-2 text-[10px] text-muted-foreground/40">
                  <Clock className="h-3 w-3" />
                  {Math.floor((now - (now - 0)) / 1000)}s elapsed
                </span>
              </div>

              <div className="space-y-1">
                {activities.map((act, i) => (
                  <motion.div
                    key={`act-${i}`}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                    className="flex items-center justify-between py-2.5 border-b border-primary-500/5 last:border-0"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <motion.div
                        animate={{
                          opacity: act.type === "mastery" ? [0.4, 1, 0.4] : 0.5,
                        }}
                        transition={{ duration: 1.5, repeat: act.type === "mastery" ? Infinity : 0 }}
                        className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                          act.type === "mastery" ? "bg-emerald-400" :
                          act.type === "adapt" ? "bg-primary-400" :
                          "bg-accent-400"
                        }`}
                      />
                      <div className="min-w-0">
                        <span className="text-sm font-medium text-foreground">{act.user}</span>{" "}
                        <span className="text-sm text-muted-foreground/60">{act.action}</span>{" "}
                        <span className="text-sm font-medium text-primary-400/80">{act.concept}</span>
                      </div>
                    </div>
                    <span className="shrink-0 text-[10px] text-muted-foreground/40 ml-3">{act.time}</span>
                  </motion.div>
                ))}
              </div>

              {/* AI adjustments ticker */}
              <div className="mt-6 pt-4 border-t border-primary-500/5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-accent-500/10">
                    <Zap className="h-3 w-3 text-accent-400" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/40">
                    AI Adjustments
                  </span>
                </div>
                <div className="space-y-1.5">
                  {AIAdjustments.map((adj, i) => (
                    <motion.div
                      key={`adj-${i}`}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 + i * 0.06 }}
                      className="flex items-center gap-2 text-[11px] text-muted-foreground/50"
                    >
                      <span className="h-0.5 w-0.5 rounded-full bg-accent-400/40" />
                      {adj}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
