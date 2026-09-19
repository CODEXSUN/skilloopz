"use client";

import { motion } from "framer-motion";
import { Sparkles, Brain, Zap, Target, Globe, Gem } from "lucide-react";

type CorridorScene = "cosmic" | "system" | "growth" | "identity" | "climax" | "default";

const sceneConfigs: Record<CorridorScene, {
  gradient: string;
  particleColor: string;
  iconColor: string;
  lineColor1: string;
  lineColor2: string;
  tempo: number;
  insights: { text: string; icon: typeof Sparkles; color: string }[];
}> = {
  cosmic: {
    gradient: "from-transparent via-purple-500/[0.03] to-transparent",
    particleColor: "var(--color-secondary)",
    iconColor: "text-purple-400",
    lineColor1: "var(--color-secondary)",
    lineColor2: "var(--color-primary)",
    tempo: 10,
    insights: [
      { text: "Exploring knowledge space", icon: Globe, color: "text-purple-400" },
      { text: "Connecting learning nodes", icon: Sparkles, color: "text-primary-400" },
      { text: "Mapping neural paths", icon: Brain, color: "text-accent-400" },
    ],
  },
  system: {
    gradient: "from-transparent via-primary-500/[0.03] to-transparent",
    particleColor: "var(--color-primary)",
    iconColor: "text-primary-400",
    lineColor1: "var(--color-primary)",
    lineColor2: "var(--color-accent)",
    tempo: 6,
    insights: [
      { text: "Processing intelligence", icon: Brain, color: "text-primary-400" },
      { text: "Adaptive path calibrated", icon: Zap, color: "text-accent-400" },
      { text: "Knowledge mapped", icon: Target, color: "text-emerald-400" },
    ],
  },
  growth: {
    gradient: "from-transparent via-emerald-500/[0.03] to-transparent",
    particleColor: "var(--color-accent)",
    iconColor: "text-emerald-400",
    lineColor1: "var(--color-accent)",
    lineColor2: "var(--color-primary)",
    tempo: 8,
    insights: [
      { text: "Milestone unlocked", icon: Gem, color: "text-emerald-400" },
      { text: "Skill tree expanding", icon: Zap, color: "text-accent-400" },
      { text: "Progress accelerating", icon: Sparkles, color: "text-primary-400" },
    ],
  },
  identity: {
    gradient: "from-transparent via-amber-500/[0.02] to-transparent",
    particleColor: "var(--color-secondary)",
    iconColor: "text-amber-400",
    lineColor1: "var(--color-secondary)",
    lineColor2: "var(--color-accent)",
    tempo: 12,
    insights: [
      { text: "Learning fingerprint detected", icon: Brain, color: "text-amber-400" },
      { text: "Cognitive patterns analyzed", icon: Globe, color: "text-purple-400" },
      { text: "Unique profile generated", icon: Sparkles, color: "text-primary-400" },
    ],
  },
  climax: {
    gradient: "from-transparent via-primary-500/[0.04] to-transparent",
    particleColor: "var(--color-primary)",
    iconColor: "text-primary-400",
    lineColor1: "var(--color-primary)",
    lineColor2: "var(--color-accent)",
    tempo: 5,
    insights: [
      { text: "Transformation complete", icon: Zap, color: "text-accent-400" },
      { text: "Future self emerging", icon: Sparkles, color: "text-primary-400" },
      { text: "New identity formed", icon: Gem, color: "text-emerald-400" },
    ],
  },
  default: {
    gradient: "from-transparent via-primary-500/[0.02] to-transparent",
    particleColor: "var(--color-primary)",
    iconColor: "text-primary-400",
    lineColor1: "var(--color-primary)",
    lineColor2: "var(--color-accent)",
    tempo: 7,
    insights: [
      { text: "Adaptive path calibrated", icon: Brain, color: "text-primary-400" },
      { text: "Confidence increasing", icon: Zap, color: "text-accent-400" },
      { text: "Knowledge mapped", icon: Target, color: "text-emerald-400" },
      { text: "AI learning in progress", icon: Sparkles, color: "text-amber-400" },
    ],
  },
};

interface IntelligenceCorridorProps {
  scene?: CorridorScene;
  variant?: "default" | "light" | "dense";
}

export function IntelligenceCorridor({ scene = "default", variant = "default" }: IntelligenceCorridorProps) {
  const config = sceneConfigs[scene];
  const particleCount = variant === "dense" ? 14 : variant === "light" ? 4 : 8;

  return (
    <div className="relative h-32 overflow-hidden pointer-events-none select-none">
      {/* Environmental ambient gradient — shifts per scene */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b"
        style={{ backgroundImage: `linear-gradient(to bottom, transparent, ${config.gradient.split(" ").slice(2).join(" ")}, transparent)` }}
      />

      {/* Atmospheric glow orb per scene */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-48 w-48 rounded-full blur-[80px]"
        style={{ background: config.particleColor.replace("var(", "").replace(")", "").replace("--color-", "").trim() ? `${config.particleColor}10` : "rgba(79,124,255,0.03)" }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: config.tempo, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Floating particles — behavior changes per scene */}
      <div className="absolute inset-0">
        {[...Array(particleCount)].map((_, i) => (
          <motion.div
            key={`env-particle-${i}`}
            className="absolute h-0.5 w-0.5 rounded-full"
            style={{
              background: config.particleColor,
              left: `${5 + (i * 13) % 90}%`,
              opacity: 0.15 + (i % 4) * 0.08,
            }}
            animate={{
              y: [0, -(15 + i * 4), 0],
              x: [0, (i % 2 === 0 ? 8 : -8) + Math.sin(i) * 4, 0],
              opacity: [0.08, 0.3 - i * 0.015, 0.08],
            }}
            transition={{
              duration: config.tempo + i * 0.6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      {/* Floating scene insights */}
      <div className="absolute inset-0 flex items-center justify-center gap-4 sm:gap-8">
        {config.insights.map((insight, i) => {
          const Icon = insight.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-1.5"
            >
              <Icon className={`h-2.5 w-2.5 ${insight.color}`} />
              <motion.span
                animate={{ opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: config.tempo * 0.4, repeat: Infinity, delay: i * 0.4 }}
                className="text-[9px] font-medium tracking-wider text-muted-foreground/30 whitespace-nowrap"
              >
                {insight.text}
              </motion.span>
            </motion.div>
          );
        })}
      </div>

      {/* Data flow lines — tempo matches scene */}
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`env-line-${scene}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="30%" stopColor={config.lineColor1} stopOpacity="0.05" />
            <stop offset="70%" stopColor={config.lineColor2} stopOpacity="0.05" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        <motion.line
          x1="0" y1="40%" x2="100%" y2="40%"
          stroke={`url(#env-line-${scene})`}
          strokeWidth="0.4"
          strokeDasharray="2 10"
          animate={{ strokeDashoffset: [0, -48] }}
          transition={{ duration: config.tempo * 0.6, repeat: Infinity, ease: "linear" }}
        />
        <motion.line
          x1="0" y1="60%" x2="100%" y2="60%"
          stroke={`url(#env-line-${scene})`}
          strokeWidth="0.3"
          strokeDasharray="1 14"
          animate={{ strokeDashoffset: [0, -60] }}
          transition={{ duration: config.tempo * 0.8, repeat: Infinity, ease: "linear", delay: 1 }}
        />
      </svg>
    </div>
  );
}
