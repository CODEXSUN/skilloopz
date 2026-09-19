"use client";

import { motion } from "framer-motion";
import { Sparkles, Target, Star, Rocket, ArrowRight } from "lucide-react";

const transformationStages = [
  {
    label: "Confused Explorer",
    before: "Fragmented knowledge, unsure where to start",
    after: "Clear learning path, foundational confidence",
    icon: Sparkles,
    color: "text-amber-400",
    glow: "bg-amber-500",
    progress: 25,
  },
  {
    label: "Consistent Builder",
    before: "Inconsistent study habits, gaps in understanding",
    after: "Daily rhythm, structured progress, retention grows",
    icon: Target,
    color: "text-primary-400",
    glow: "bg-primary-500",
    progress: 50,
  },
  {
    label: "Confident Creator",
    before: "Can follow but can't build independently",
    after: "Applies knowledge, builds projects, teaches others",
    icon: Star,
    color: "text-accent-400",
    glow: "bg-accent-500",
    progress: 75,
  },
  {
    label: "Masterful Innovator",
    before: "Plateaued growth, limited by old methods",
    after: "Adaptive mastery, creates new knowledge, leads",
    icon: Rocket,
    color: "text-emerald-400",
    glow: "bg-emerald-500",
    progress: 100,
  },
];

export function FutureSelfSection() {
  return (
    <section className="relative overflow-hidden px-6 py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/3 h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-gradient-to-br from-primary-200/8 via-accent-200/5 to-emerald-200/6 blur-[180px] animate-ambient-float" />
      </div>

      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16 text-center"
        >
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-primary-400">
            Your Future Self
          </p>
          <h2 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl text-foreground">
            See who you&apos;re becoming
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-sm leading-relaxed text-muted-foreground/70">
            Every session rewires your capabilities. Watch the transformation unfold.
          </p>
        </motion.div>

        <div className="relative">
          {/* Central transformation pipeline */}
          <div className="absolute left-[32px] top-12 bottom-12 w-[2px] hidden sm:block pointer-events-none">
            <motion.div
              className="h-full w-full bg-gradient-to-b from-amber-400/30 via-primary-400/30 via-accent-400/30 to-emerald-400/30"
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformOrigin: "top" }}
            />
            <motion.div
              className="absolute top-0 w-full h-3 rounded-full bg-primary-400 blur-sm"
              animate={{ top: ["0%", "100%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
          </div>

          <div className="flex flex-col gap-8 sm:gap-12">
            {transformationStages.map((stage, i) => {
              const Icon = stage.icon;

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.7, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                  className="relative flex flex-col sm:flex-row gap-4 sm:gap-8 items-start"
                >
                  {/* Stage marker */}
                  <div className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center">
                    <div className={`absolute inset-0 rounded-2xl ${stage.glow}/10 blur-xl`} />
                    <div className={`glass-hero-card relative flex h-16 w-16 items-center justify-center rounded-2xl border-primary-500/10`}>
                      <Icon className={`h-7 w-7 ${stage.color}`} />
                    </div>
                    {/* Progress ring */}
                    <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 64 64">
                      <motion.circle
                        cx="32" cy="32" r="28"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeDasharray={`${stage.progress * 1.76} 176`}
                        className="text-primary-400/30"
                        initial={{ strokeDasharray: "0 176" }}
                        whileInView={{ strokeDasharray: `${stage.progress * 1.76} 176` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.3 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </svg>
                  </div>

                  {/* Content card */}
                  <div className="flex-1">
                    <div className="glass-hero-panel rounded-[20px] p-6 sm:p-8">
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">
                          Stage {i + 1}
                        </span>
                        <span className="h-3 w-[1px] bg-primary-500/10" />
                        <span className={`text-sm font-bold ${stage.color}`}>{stage.label}</span>
                        <span className="ml-auto text-[10px] font-bold text-muted-foreground/30">
                          {stage.progress}%
                        </span>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl bg-red-500/5 border border-red-500/10 p-3">
                          <p className="text-[9px] font-bold uppercase tracking-wider text-red-400/60 mb-1">Before</p>
                          <p className="text-xs text-muted-foreground/60 leading-relaxed">{stage.before}</p>
                        </div>
                        <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/10 p-3">
                          <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-400/60 mb-1">After</p>
                          <p className="text-xs text-emerald-400/80 leading-relaxed">{stage.after}</p>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-4 h-1 w-full rounded-full bg-primary-500/5 overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full bg-gradient-to-r ${i < 3 ? "from-primary-400 to-accent-400" : "from-emerald-400 to-emerald-400"}`}
                          initial={{ width: "0%" }}
                          whileInView={{ width: `${stage.progress}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.4 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Arrow connector */}
                  {i < transformationStages.length - 1 && (
                    <div className="hidden sm:flex absolute -bottom-6 left-8 z-10">
                      <motion.div
                        animate={{ y: [0, 3, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <ArrowRight className="h-4 w-4 text-primary-400/30 rotate-90" />
                      </motion.div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
