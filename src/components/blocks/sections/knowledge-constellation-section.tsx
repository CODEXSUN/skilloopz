"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { Code2, Brain, Beaker, Palette, Globe, BookOpen } from "lucide-react";

const subjects = [
  { id: 0, label: "Math", icon: Beaker, color: "text-blue-400", glow: "bg-blue-500", x: 50, y: 15 },
  { id: 1, label: "Coding", icon: Code2, color: "text-emerald-400", glow: "bg-emerald-500", x: 82, y: 28 },
  { id: 2, label: "Science", icon: Brain, color: "text-purple-400", glow: "bg-purple-500", x: 72, y: 55 },
  { id: 3, label: "Design", icon: Palette, color: "text-pink-400", glow: "bg-pink-500", x: 28, y: 50 },
  { id: 4, label: "AI", icon: Globe, color: "text-cyan-400", glow: "bg-cyan-500", x: 45, y: 72 },
  { id: 5, label: "Language", icon: BookOpen, color: "text-amber-400", glow: "bg-amber-500", x: 15, y: 30 },
];

const connections = [
  [0, 2], [0, 4], [1, 2], [1, 4], [2, 3], [2, 4], [3, 5], [4, 5], [0, 5], [1, 3],
];

export function KnowledgeConstellationSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [activeSubject, setActiveSubject] = useState<number | null>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const springX = useSpring(mouseX, { stiffness: 40, damping: 35 });
  const springY = useSpring(mouseY, { stiffness: 40, damping: 35 });
  const driftX = useTransform(springX, (v) => (v - 0.5) * 6);
  const driftY = useTransform(springY, (v) => (v - 0.5) * 6);

  const handleMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  const activeConnections = activeSubject !== null
    ? connections.filter((c) => c[0] === activeSubject || c[1] === activeSubject)
    : [];

  const [randomPathCounts] = useState(() =>
    subjects.map(() => Math.floor(Math.random() * 20 + 10)),
  );

  return (
    <section className="relative overflow-hidden px-6 py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/3 top-1/3 h-[600px] w-[600px] rounded-full bg-blue-200/8 dark:bg-blue-500/4 blur-[160px] animate-ambient-float" />
        <div className="absolute right-1/4 bottom-1/4 h-[400px] w-[400px] rounded-full bg-purple-200/6 dark:bg-purple-500/3 blur-[120px] animate-ambient-float" style={{ animationDelay: "-8s" }} />
      </div>

      <div className="mx-auto max-w-6xl">
        {/* Left-aligned header for layout diversity */}
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-4"
          >
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-primary-400">
              Knowledge Constellation
            </p>
            <h2 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl text-foreground">
              Explore your learning universe
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground/60 max-w-sm">
              Hover nodes to discover connected skills. Your knowledge network grows with every lesson.
            </p>
          </motion.div>

          <div
            ref={ref}
            onMouseMove={handleMove}
            className="lg:col-span-8 relative aspect-[4/3]"
          >
          {/* SVG connections */}
          <svg className="absolute inset-0 h-full w-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
            {connections.map(([a, b], i) => {
              const from = subjects[a];
              const to = subjects[b];
              const isActive = activeSubject !== null &&
                (activeConnections.some((c) => c[0] === a && c[1] === b) || activeConnections.some((c) => c[0] === b && c[1] === a));
              return (
                <motion.path
                  key={`conn-${i}`}
                  d={`M ${from.x} ${from.y} Q ${(from.x + to.x) / 2 + 4} ${(from.y + to.y) / 2 - 6} ${to.x} ${to.y}`}
                  fill="none"
                  stroke="var(--color-primary)"
                  strokeWidth={isActive ? 1.2 : 0.4}
                  strokeOpacity={isActive ? 0.35 : 0.08}
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                />
              );
            })}
          </svg>

          {/* Subject nodes */}
          {subjects.map((subj) => {
            const Icon = subj.icon;
            const isActive = activeSubject === subj.id;
            const isConnected = activeSubject !== null &&
              connections.some((c) =>
                (c[0] === activeSubject && c[1] === subj.id) || (c[1] === activeSubject && c[0] === subj.id)
              );

            return (
              <div
                key={subj.id}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${subj.x}%`, top: `${subj.y}%` }}
              >
                <motion.div
                  style={{ x: driftX, y: driftY }}
                  onMouseEnter={() => setActiveSubject(subj.id)}
                  onMouseLeave={() => setActiveSubject(null)}
                  className="cursor-pointer"
                >
                  <motion.div
                    animate={{
                      scale: isActive ? 1.15 : isConnected ? 1.05 : 1,
                    }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="relative"
                  >
                    {/* Glow halo */}
                    <motion.div
                      animate={{
                        opacity: isActive ? 0.6 : isConnected ? 0.3 : 0,
                        scale: isActive ? 1.4 : isConnected ? 1.2 : 0.8,
                      }}
                      transition={{ duration: 0.4 }}
                      className={`absolute inset-0 rounded-full ${subj.glow}/20 blur-xl`}
                    />

                    {/* Node */}
                    <div className="glass-hero-card relative flex h-14 w-14 items-center justify-center rounded-[18px] sm:h-16 sm:w-16 shadow-lg">
                      <Icon className={`h-6 w-6 sm:h-7 sm:w-7 ${subj.color} transition-transform duration-300 ${isActive ? "scale-110" : ""}`} />
                    </div>

                    {/* Label */}
                    <p className={`mt-2 text-center text-[10px] font-bold uppercase tracking-[0.15em] transition-all duration-300 ${isActive ? "text-foreground" : "text-muted-foreground/50"}`}>
                      {subj.label}
                    </p>
                  </motion.div>

                  {/* Detail card on hover */}
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute top-full mt-3 left-1/2 -translate-x-1/2 w-48 z-20"
                    >
                      <div className="glass-hero-panel rounded-[16px] p-4 text-center">
                        <p className="text-xs font-semibold text-foreground mb-1">{subj.label}</p>
                        <p className="text-[10px] text-muted-foreground/70 leading-relaxed">
                          {subj.id === 0 && "Foundations of logical reasoning and quantitative analysis"}
                          {subj.id === 1 && "Build software, algorithms, and digital solutions"}
                          {subj.id === 2 && "Explore natural phenomena through scientific method"}
                          {subj.id === 3 && "Create visual experiences with form, color, and function"}
                          {subj.id === 4 && "Intelligent systems that learn, reason, and adapt"}
                          {subj.id === 5 && "Communicate across cultures through linguistic mastery"}
                        </p>
                        <div className="mt-2 flex items-center justify-center gap-1 text-[9px] text-primary-400/60">
                          <span className="h-1 w-1 rounded-full bg-primary-400/60 animate-pulse" />
                          <span>{randomPathCounts[subj.id]} adaptive paths</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </div>
            );
          })}
        </div>
        </div>
      </div>
    </section>
  );
}
