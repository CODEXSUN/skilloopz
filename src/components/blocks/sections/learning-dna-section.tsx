"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { Brain, Eye, Zap, BookOpen, BarChart3, Compass, Sparkles } from "lucide-react";

const cognitiveTraits = [
  { label: "Visual Thinking", icon: Eye, value: 88, color: "#4F7CFF", desc: "Spatial & pattern recognition dominance" },
  { label: "Processing Speed", icon: Zap, value: 76, color: "#3DD9FF", desc: "Rapid analytical reasoning" },
  { label: "Retention Strength", icon: BarChart3, value: 94, color: "#34D399", desc: "Exceptional knowledge recall" },
  { label: "Cognitive Depth", icon: Brain, value: 82, color: "#A78BFA", desc: "Deep conceptual understanding" },
  { label: "Exploration Drive", icon: Compass, value: 71, color: "#FBBF24", desc: "Broad learning curiosity" },
  { label: "Focus Endurance", icon: BookOpen, value: 79, color: "#22D3EE", desc: "Sustained concentration ability" },
];

const personalityAxes = [
  { label: "Analytical", value: 82, opposite: "Intuitive" },
  { label: "Systematic", value: 65, opposite: "Exploratory" },
  { label: "Independent", value: 73, opposite: "Collaborative" },
  { label: "Applied", value: 78, opposite: "Theoretical" },
];

interface MorphingBlobProps {
  value: number;
  color: string;
  delay: number;
}

function MorphingBlob({ value, color, delay }: MorphingBlobProps) {
  const seed = value / 100;
  const pathA = `M 50 5 C ${60 + seed * 20} ${5 + seed * 10} ${85} ${20 + (1 - seed) * 15} ${90} ${45 + seed * 10} C ${95} ${65 - seed * 10} ${80} ${85} ${55} ${90} C ${30} ${95} ${10} ${80} ${8} ${50 - seed * 5} C ${5} ${25 + seed * 10} ${25 + seed * 15} ${10} ${50} ${5} Z`;
  const pathB = `M 50 8 C ${55 + seed * 15} ${10} ${82} ${25 + seed * 10} ${88} ${48 + seed * 8} C ${92} ${62 - seed * 8} ${78} ${82} ${52} ${88} C ${28} ${92} ${12} ${75} ${10} ${48 - seed * 5} C ${8} ${28 + seed * 8} ${30 + seed * 10} ${12} ${50} ${8} Z`;

  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <defs>
        <radialGradient id={`blob-grad-${delay}`} cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="60%" stopColor={color} stopOpacity="0.08" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </radialGradient>
      </defs>
      <motion.path
        d={pathA}
        fill={`url(#blob-grad-${delay})`}
        animate={{ d: [pathA, pathB, pathA] }}
        transition={{ duration: 6 + delay, repeat: Infinity, ease: "easeInOut" }}
        className="drop-shadow-[0_0_15px_rgba(79,124,255,0.05)]"
      />
    </svg>
  );
}

export function LearningDnaSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [activeTrait, setActiveTrait] = useState<number | null>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const springX = useSpring(mouseX, { stiffness: 30, damping: 40 });
  const springY = useSpring(mouseY, { stiffness: 30, damping: 40 });
  const driftX = useTransform(springX, (v) => (v - 0.5) * 6);
  const driftY = useTransform(springY, (v) => (v - 0.5) * 6);

  const handleMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  return (
    <section className="relative overflow-hidden px-6 py-32">
      {/* Deep atmospheric background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/4 h-[600px] w-[600px] rounded-full bg-purple-500/4 blur-[180px]" />
        <div className="absolute right-1/4 bottom-1/4 h-[500px] w-[500px] rounded-full bg-cyan-500/3 blur-[160px]" />
        <div className="absolute left-1/2 top-1/3 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-primary-500/4 blur-[140px]" />
      </div>

      <div className="mx-auto max-w-6xl">
        {/* Section header — left-aligned for layout diversity */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-20 max-w-xl"
        >
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-primary-400">
            Your Learning DNA
          </p>
          <h2 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl text-foreground">
            A living cognitive fingerprint
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground/60">
            Not a static profile — an evolving neural identity shaped by every session, every insight, every breakthrough.
          </p>
        </motion.div>

        <div ref={ref} onMouseMove={handleMove}>
          {/* Organic cognitive landscape */}
          <div className="grid gap-12 lg:grid-cols-12">
            {/* Left — Morphing trait blobs */}
            <div className="lg:col-span-7 space-y-6">
              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                {cognitiveTraits.map((trait, i) => {
                  const isActive = activeTrait === i;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.1 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                      onMouseEnter={() => setActiveTrait(i)}
                      onMouseLeave={() => setActiveTrait(null)}
                      className={`group relative overflow-hidden rounded-2xl p-5 transition-all duration-500 cursor-default ${isActive ? "border-primary-500/20" : "border-transparent"}`}
                      style={{
                        background: isActive
                          ? `linear-gradient(135deg, ${trait.color}08, transparent)`
                          : "transparent",
                        border: "1px solid",
                        borderColor: isActive ? `${trait.color}20` : "var(--glass-border)",
                      }}
                    >
                      {/* Morphing blob background */}
                      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 opacity-30">
                        <MorphingBlob value={trait.value} color={trait.color} delay={i} />
                      </div>

                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className="flex h-9 w-9 items-center justify-center rounded-xl"
                            style={{ background: `${trait.color}15`, border: `1px solid ${trait.color}20` }}
                          >
                            <trait.icon className="h-4.5 w-4.5" style={{ color: trait.color }} />
                          </div>
                          <span className="text-xs font-bold text-foreground">{trait.label}</span>
                        </div>

                        {/* Organic progress — not a bar but a flowing ribbon */}
                        <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: `${trait.color}10` }}>
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: `linear-gradient(to right, ${trait.color}, ${trait.color}80)` }}
                            initial={{ width: "0%" }}
                            whileInView={{ width: `${trait.value}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.5, delay: 0.2 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                          />
                        </div>

                        {/* Value */}
                        <motion.span
                          className="mt-2 block text-lg font-bold tracking-tight"
                          style={{ color: trait.color }}
                          initial={{ opacity: 0 }}
                          whileInView={{ opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.4 + i * 0.06 }}
                        >
                          {trait.value}%
                        </motion.span>

                        {/* Hover detail */}
                        <motion.div
                          animate={{ height: isActive ? "auto" : 0, opacity: isActive ? 1 : 0 }}
                          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                          className="overflow-hidden"
                        >
                          <p className="pt-2 text-[10px] leading-relaxed text-muted-foreground/50">{trait.desc}</p>
                        </motion.div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Right — Personality axis + neural pattern */}
            <motion.div
              style={{ x: driftX, y: driftY }}
              className="lg:col-span-5 flex flex-col justify-center gap-8"
            >
              {/* Personality axes — radial-like display */}
              <div className="glass-hero-panel rounded-2xl p-6 sm:p-8">
                <h3 className="mb-6 text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground/50 flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-accent-400" />
                  Cognition Axis
                </h3>
                <div className="space-y-5">
                  {personalityAxes.map((axis, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 15 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                      className="relative"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-medium text-foreground/70">{axis.label}</span>
                        <span className="text-[10px] text-muted-foreground/40">{axis.opposite}</span>
                      </div>
                      <div className="relative h-2 rounded-full bg-primary-500/8 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{
                            background: `linear-gradient(to right, var(--color-primary), var(--color-accent))`,
                          }}
                          initial={{ width: "0%" }}
                          whileInView={{ width: `${axis.value}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.2, delay: 0.4 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                        />
                        {/* Axis indicator dot */}
                        <motion.div
                          className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-background"
                          style={{
                            background: "var(--color-primary)",
                            left: `${axis.value}%`,
                          }}
                          initial={{ opacity: 0 }}
                          whileInView={{ opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.6 + i * 0.08 }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Neural signature — organic flowing connection */}
              <div className="glass-hero-panel rounded-2xl p-6 sm:p-8">
                <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground/50">
                  Neural Signature
                </h3>
                <div className="relative h-20">
                  <svg className="h-full w-full" viewBox="0 0 300 80" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="neural-signature" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.3" />
                        <stop offset="50%" stopColor="var(--color-accent)" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="var(--color-secondary)" stopOpacity="0.3" />
                      </linearGradient>
                    </defs>
                    {[0, 1, 2].map((line) => (
                      <motion.path
                        key={line}
                        d={`M 0 ${40 + line * 5} Q ${75 + Math.sin(line) * 20} ${10 + line * 8} ${150} ${45 - line * 3} T ${300} ${35 + line * 3}`}
                        fill="none"
                        stroke="url(#neural-signature)"
                        strokeWidth="0.5"
                        strokeOpacity={0.3 - line * 0.05}
                        initial={{ pathLength: 0 }}
                        whileInView={{ pathLength: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 2, delay: 0.5 + line * 0.2, ease: [0.16, 1, 0.3, 1] }}
                      />
                    ))}
                    {[0, 1, 2].map((dot) => (
                      <motion.circle
                        key={`dot-${dot}`}
                        cx={150 + dot * 40}
                        cy={40 - dot * 8}
                        r="2"
                        fill="var(--color-primary)"
                        fillOpacity="0.2"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 1.5 + dot * 0.2 }}
                      />
                    ))}
                  </svg>
                  <motion.div
                    animate={{ opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute bottom-0 left-0 right-0 text-center text-[8px] font-mono text-muted-foreground/20 tracking-widest"
                  >
                    UNIQUE_IDENTIFIER_NEOT_{"{ /* random */}"}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
