"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Zap, Trophy, Star, TrendingUp, Target, Flame, Gem, Award } from "lucide-react";

const milestones = [
  { label: "First Login", icon: Star, color: "text-amber-400", glow: "bg-amber-500", xp: 10, unlocked: true },
  { label: "3-Day Streak", icon: Flame, color: "text-orange-400", glow: "bg-orange-500", xp: 50, unlocked: true },
  { label: "10 Challenges", icon: Target, color: "text-primary-400", glow: "bg-primary-500", xp: 100, unlocked: true },
  { label: "Speed Demon", icon: Zap, color: "text-accent-400", glow: "bg-accent-500", xp: 150, unlocked: false },
  { label: "Knowledge Seeker", icon: Gem, color: "text-purple-400", glow: "bg-purple-500", xp: 200, unlocked: false },
  { label: "Mastermind", icon: Trophy, color: "text-emerald-400", glow: "bg-emerald-500", xp: 500, unlocked: false },
];

const skillTree = [
  { name: "Logic & Reasoning", progress: 78, color: "from-primary-500 to-primary-400", nodes: 12 },
  { name: "Problem Solving", progress: 65, color: "from-accent-500 to-accent-400", nodes: 8 },
  { name: "Knowledge Retention", progress: 92, color: "from-emerald-500 to-emerald-400", nodes: 15 },
  { name: "Learning Speed", progress: 71, color: "from-amber-500 to-amber-400", nodes: 10 },
];

const recentActivity = [
  { action: "Completed", target: "Calculus Fundamentals", xp: 45, time: "2m ago" },
  { action: "Streak Milestone", target: "7 days", xp: 100, time: "15m ago" },
  { action: "Mastery Unlocked", target: "Python Basics", xp: 200, time: "1h ago" },
  { action: "Challenge Won", target: "Speed Quiz #12", xp: 30, time: "2h ago" },
];

export function AchievementEcosystemSection() {
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const xpRef = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!xpRef.current || started) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
          const startTime = performance.now();
          const targetXp = 2470;
          const targetLevel = 12;
          function tick(now: number) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / 2000, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setXp(Math.floor(eased * targetXp));
            setLevel(Math.max(1, Math.floor(eased * targetLevel)));
            if (progress < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(xpRef.current);
    return () => observer.disconnect();
  }, [started]);

  return (
    <section className="relative overflow-hidden px-6 py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-amber-200/6 dark:bg-amber-500/3 blur-[140px] animate-ambient-float" />
        <div className="absolute right-1/4 bottom-1/4 h-[400px] w-[400px] rounded-full bg-primary-200/8 dark:bg-primary-500/4 blur-[120px] animate-ambient-float" style={{ animationDelay: "-7s" }} />
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
            Achievement Ecosystem
          </p>
          <h2 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl text-foreground">
            Your growth, visualized
          </h2>
          <p className="mt-4 max-w-xl mx-auto text-sm text-muted-foreground/60">
            Every milestone, streak, and skill unlocked tells your learning story
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left: Level & XP Card */}
          <div className="lg:col-span-4 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              ref={xpRef}
              className="glass-hero-panel rounded-[24px] p-8 text-center"
            >
              <div className="relative mx-auto mb-6 flex h-28 w-28 items-center justify-center">
                <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 112 112">
                  <circle cx="56" cy="56" r="48" fill="none" stroke="var(--color-primary)" strokeWidth="3" strokeOpacity="0.1" />
                  <motion.circle
                    cx="56" cy="56" r="48"
                    fill="none"
                    stroke="var(--color-primary)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${(xp % 500) / 500 * 301.6} 301.6`}
                    initial={{ strokeDasharray: "0 301.6" }}
                    whileInView={{ strokeDasharray: `${(xp % 500) / 500 * 301.6} 301.6` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  />
                </svg>
                <div className="relative z-10 flex flex-col items-center">
                  <span className="font-heading text-4xl font-bold text-foreground">{level}</span>
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">Level</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground/60">
                  <span>XP Progress</span>
                  <span>{xp} / 500</span>
                </div>
                <div className="h-2 w-full rounded-full bg-primary-500/10 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500"
                    initial={{ width: "0%" }}
                    whileInView={{ width: `${(xp % 500) / 500 * 100}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="glass-hero-card rounded-[20px] p-6"
            >
              <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground/60 flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-accent-400" />
                Recent Activity
              </h3>
              <div className="space-y-3">
                {recentActivity.map((act, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                    className="flex items-center justify-between py-2 border-b border-primary-500/5 last:border-0"
                  >
                    <div className="min-w-0">
                      <span className="text-xs font-medium text-foreground">{act.action}</span>{" "}
                      <span className="text-xs text-muted-foreground/60">{act.target}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <span className="text-[10px] font-bold text-accent-400/70">+{act.xp}XP</span>
                      <span className="text-[9px] text-muted-foreground/30">{act.time}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right: Skill Tree & Milestones */}
          <div className="lg:col-span-8 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="glass-hero-panel rounded-[24px] p-8"
            >
              <h3 className="mb-6 text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground/60 flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-primary-400" />
                Skill Tree Progress
              </h3>
              <div className="grid gap-6 sm:grid-cols-2">
                {skillTree.map((skill, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.08 }}
                    className="group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-foreground">{skill.name}</span>
                      <span className="text-xs font-bold text-muted-foreground/50">{skill.progress}%</span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-primary-500/8 overflow-hidden border border-primary-500/5">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r"
                        style={{ backgroundImage: `linear-gradient(to right, ${skill.color.split(" ")[0]}, ${skill.color.split(" ")[2]})` }}
                        initial={{ width: "0%" }}
                        whileInView={{ width: `${skill.progress}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, delay: 0.3 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </div>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <motion.div
                        animate={{ opacity: [0.3, 0.8, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                        className="h-1 w-1 rounded-full bg-primary-400/60"
                      />
                      <span className="text-[9px] text-muted-foreground/40">{skill.nodes} skill nodes</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="glass-hero-panel rounded-[24px] p-8"
            >
              <h3 className="mb-6 text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground/60 flex items-center gap-2">
                <Award className="h-3.5 w-3.5 text-amber-400" />
                Milestones
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {milestones.map((m, i) => {
                  const Icon = m.icon;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.06 }}
                      className={`flex flex-col items-center gap-2 rounded-2xl p-4 text-center transition-all duration-300 ${m.unlocked ? "bg-primary-500/5 border border-primary-500/10" : "bg-transparent border border-primary-500/5 opacity-40"}`}
                    >
                      <div className={`relative flex h-10 w-10 items-center justify-center rounded-xl ${m.unlocked ? `bg-gradient-to-br ${m.glow}/10` : "bg-primary-500/5"}`}>
                        <Icon className={`h-5 w-5 ${m.unlocked ? m.color : "text-muted-foreground/40"}`} />
                        {m.unlocked && (
                          <motion.div
                            animate={{ opacity: [0.3, 0.6, 0.3] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className={`absolute inset-0 rounded-xl ${m.glow}/20 blur-lg`}
                          />
                        )}
                      </div>
                      <span className={`text-[9px] font-bold uppercase tracking-wider ${m.unlocked ? "text-foreground" : "text-muted-foreground/40"}`}>
                        {m.label}
                      </span>
                      <span className="text-[8px] font-mono text-muted-foreground/30">{m.xp} XP</span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
