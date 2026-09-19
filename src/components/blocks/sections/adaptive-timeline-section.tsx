"use client";

import { motion } from "framer-motion";
import { Search, Route, Zap, Award, TrendingUp } from "lucide-react";

const stages = [
  {
    icon: Search,
    label: "Assessment",
    desc: "AI evaluates your current knowledge, learning style, and goals to build your foundation",
    color: "from-primary-500/20 to-primary-400/10",
    accent: "text-primary-400",
    stat: "Knowledge mapped",
  },
  {
    icon: Route,
    label: "Personalization",
    desc: "Curriculum adapts to your level — concepts reorganize, difficulty calibrates, paths emerge",
    color: "from-secondary-500/20 to-secondary-400/10",
    accent: "text-secondary-400",
    stat: "Path optimized",
  },
  {
    icon: Zap,
    label: "Engagement",
    desc: "Interactive challenges adjust in real-time. Struggle triggers support, mastery triggers acceleration",
    color: "from-accent-500/20 to-accent-400/10",
    accent: "text-accent-400",
    stat: "Flow state",
  },
  {
    icon: Award,
    label: "Mastery",
    desc: "Deep learning through spaced repetition, applied projects, and knowledge synthesis",
    color: "from-emerald-500/20 to-emerald-400/10",
    accent: "text-emerald-400",
    stat: "Retention optimized",
  },
  {
    icon: TrendingUp,
    label: "Growth",
    desc: "Continuous evolution — your progress data trains the model, making it smarter for you",
    color: "from-amber-500/20 to-amber-400/10",
    accent: "text-amber-400",
    stat: "Always adapting",
  },
];

const BRANCH_PATHS = [
  "M 50 0 Q 60 25 50 50 Q 40 75 50 100",
  "M 50 0 Q 40 15 55 30 Q 45 50 60 65 Q 40 80 50 100",
  "M 50 0 Q 60 10 40 25 Q 55 40 35 55 Q 65 70 45 85 Q 55 95 50 100",
];

export function AdaptiveTimelineSection() {
  return (
    <section className="relative overflow-hidden px-6 py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-0 top-1/4 h-[500px] w-[500px] rounded-full bg-primary-200/8 dark:bg-primary-500/4 blur-[140px] animate-ambient-float" />
        <div className="absolute left-0 bottom-1/4 h-[400px] w-[400px] rounded-full bg-accent-200/6 dark:bg-accent-500/3 blur-[100px] animate-ambient-float" style={{ animationDelay: "-10s" }} />
      </div>

      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-20 text-center"
        >
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-primary-400">
            Your Adaptive Journey
          </p>
          <h2 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl text-foreground">
            A path that evolves with you
          </h2>
        </motion.div>

        <div className="relative mx-auto max-w-4xl">
          {/* Central animated timeline SVG */}
          <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-20 hidden lg:block pointer-events-none">
            <svg viewBox="0 0 100 600" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
              {/* Static trunk */}
              <motion.path
                d="M 50 0 L 50 600"
                fill="none"
                stroke="var(--color-primary)"
                strokeWidth="0.5"
                strokeOpacity="0.08"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              />

              {/* Morphing branches */}
              {BRANCH_PATHS.map((path, i) => (
                <motion.path
                  key={`branch-${i}`}
                  d={path}
                  fill="none"
                  stroke={`var(--color-${["primary", "accent", "secondary"][i]})`}
                  strokeWidth="0.5"
                  strokeOpacity="0.12"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 2, delay: 0.5 + i * 0.3, ease: [0.16, 1, 0.3, 1] }}
                />
              ))}

              {/* Animated pulse traveling the trunk */}
              <motion.circle
                r="3"
                fill="var(--color-primary)"
                fillOpacity="0.3"
                cx="50"
                animate={{ cy: [0, 600] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              />
            </svg>
          </div>

          <div className="flex flex-col gap-20 lg:gap-28">
            {stages.map((stage, i) => {
              const Icon = stage.icon;
              const isLeft = i % 2 === 0;

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.8, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                  className={`relative flex items-center gap-8 lg:gap-16 ${isLeft ? "lg:flex-row" : "lg:flex-row-reverse"}`}
                >
                  <div className={`flex-1 ${isLeft ? "lg:text-right" : "lg:text-left"}`}>
                    <div className={`glass-hero-card inline-block rounded-[24px] p-6 sm:p-8 max-w-md ${!isLeft ? "lg:ml-auto" : ""}`}>
                      <div className={`flex items-center gap-4 mb-3 ${!isLeft ? "lg:flex-row-reverse" : ""}`}>
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stage.color} border border-primary-500/10`}>
                          <Icon className={`h-5 w-5 ${stage.accent}`} />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
                            Phase {i + 1}
                          </span>
                          <h3 className="text-lg font-bold text-foreground">{stage.label}</h3>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground/80">{stage.desc}</p>

                      {/* Stat tag */}
                      <div className={`mt-4 flex items-center gap-2 ${!isLeft ? "lg:justify-end" : ""}`}>
                        <motion.div
                          animate={{ opacity: [0.4, 0.8, 0.4] }}
                          transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                          className="h-1 w-1 rounded-full bg-primary-400/60"
                        />
                        <span className="text-[10px] font-medium text-primary-400/60 uppercase tracking-wider">
                          {stage.stat}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Timeline node dot */}
                  <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center justify-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.2 + i * 0.12, type: "spring" }}
                      className="relative"
                    >
                      <div className="h-5 w-5 rounded-full bg-background border-2 border-primary-400/30 shadow-[0_0_16px_rgba(79,124,255,0.15)]">
                        <motion.div
                          animate={{ scale: [1, 1.5, 1] }}
                          transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                          className="h-full w-full rounded-full bg-primary-400/50"
                        />
                      </div>
                    </motion.div>
                  </div>

                  <div className="hidden lg:block flex-1" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
