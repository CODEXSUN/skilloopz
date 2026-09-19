"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Target, BarChart3, Brain, Zap } from "lucide-react";

const steps = [
  {
    icon: Target,
    label: "Choose",
    desc: "Pick a course that matches your goals",
    color: "from-primary-500/20 to-primary-400/10",
    accent: "text-primary-400",
  },
  {
    icon: Brain,
    label: "Adapt",
    desc: "AI maps your knowledge and learning pace",
    color: "from-secondary-500/20 to-secondary-400/10",
    accent: "text-secondary-400",
  },
  {
    icon: Zap,
    label: "Practice",
    desc: "Interactive lessons adapt to your progress",
    color: "from-accent-500/20 to-accent-400/10",
    accent: "text-accent-400",
  },
  {
    icon: BarChart3,
    label: "Track",
    desc: "Real-time analytics show your growth",
    color: "from-emerald-500/20 to-emerald-400/10",
    accent: "text-emerald-400",
  },
  {
    icon: Sparkles,
    label: "Excel",
    desc: "Master concepts faster with adaptive learning",
    color: "from-amber-500/20 to-amber-400/10",
    accent: "text-amber-400",
  },
];

export function HowItWorksSection() {
  return (
    <section className="relative overflow-hidden px-6 py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-0 top-1/3 h-[500px] w-[500px] rounded-full bg-primary-200/8 dark:bg-primary-500/4 blur-[120px] animate-ambient-float" />
        <div className="absolute left-0 bottom-1/4 h-[400px] w-[400px] rounded-full bg-cyan-200/6 dark:bg-cyan-500/3 blur-[100px] animate-ambient-float" style={{ animationDelay: "-10s" }} />
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
            How It Works
          </p>
          <h2 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl text-foreground">
            Your adaptive learning journey
          </h2>
        </motion.div>

        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary-400/15 to-transparent hidden lg:block" />

          <div className="flex flex-col gap-16 lg:gap-24">
            {steps.map((step, i) => {
              const Icon = step.icon;
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
                  {/* Content card */}
                  <div className={`flex-1 ${isLeft ? "lg:text-right" : "lg:text-left"}`}>
                    <div className={`glass-hero-card inline-block rounded-[24px] p-6 sm:p-8 max-w-md ${!isLeft ? "lg:ml-auto" : ""}`}>
                      <div className={`flex items-center gap-4 mb-3 ${!isLeft ? "lg:flex-row-reverse" : ""}`}>
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${step.color} border border-primary-500/10`}>
                          <Icon className={`h-5 w-5 ${step.accent}`} />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
                            Step {i + 1}
                          </span>
                          <h3 className="text-lg font-bold text-foreground">{step.label}</h3>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground/80">{step.desc}</p>

                      {/* Connecting dot */}
                      <div className={`absolute top-1/2 -translate-y-1/2 hidden lg:flex items-center ${isLeft ? "right-0 translate-x-[calc(50%+0.5px)]" : "left-0 -translate-x-[calc(50%+0.5px)]"}`}>
                        <motion.div
                          initial={{ scale: 0 }}
                          whileInView={{ scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.4, delay: 0.3 + i * 0.12, type: "spring" }}
                          className="h-4 w-4 rounded-full bg-primary-500/20 border-2 border-primary-400/40 shadow-[0_0_12px_rgba(79,124,255,0.2)]"
                        >
                          <motion.div
                            animate={{ scale: [1, 1.4, 1] }}
                            transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                            className="h-full w-full rounded-full bg-primary-400/60"
                          />
                        </motion.div>
                      </div>
                    </div>
                  </div>

                  {/* Spacer for the other side */}
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
