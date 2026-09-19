"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { InlineEditor } from "@/components/dev-mode/InlineEditor";
import { useDevModeStore } from "@/stores/devModeStore";
import { usePageBuilderStore } from "@/stores/pageBuilderStore";

interface HeroSectionProps {
  content: Record<string, unknown>;
  blockId?: string;
}

const PARTICLE_COUNT = 4;
const NODE_COUNT = 2;

export function HeroSection({ content, blockId }: HeroSectionProps) {
  const devModeEnabled = useDevModeStore((s) => s.enabled);
  const updateSection = usePageBuilderStore((s) => s.updateSection);
  const viewportRef = useRef({ w: 1920, h: 1080 });
  const [mounted, setMounted] = useState(false);

  // Simplified mouse tracking - only 2 springs instead of 10
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const springX = useSpring(rawX, { stiffness: 40, damping: 30 });
  const springY = useSpring(rawY, { stiffness: 40, damping: 30 });

  // Single parallax layer instead of 5
  const parallaxX = useTransform(springX, (v) => {
    const { w } = viewportRef.current;
    return (v / w - 0.5) * 12;
  });
  const parallaxY = useTransform(springY, (v) => {
    const { h } = viewportRef.current;
    return (v / h - 0.5) * 12;
  });

  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      viewportRef.current = { w: window.innerWidth, h: window.innerHeight };
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Throttled mouse move - only update on animation frame
  useEffect(() => {
    let rafId: number;
    let lastX = 0;
    let lastY = 0;
    const threshold = 2; // Only update if moved more than 2px

    const handleMouseMove = (e: MouseEvent) => {
      if (Math.abs(e.clientX - lastX) < threshold && Math.abs(e.clientY - lastY) < threshold) return;
      lastX = e.clientX;
      lastY = e.clientY;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        rawX.set(e.clientX);
        rawY.set(e.clientY);
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [rawX, rawY]);

  const title = (content.title as string) || "Adaptive Learning. Built for Humans.";
  const subtitle =
    (content.subtitle as string) ||
    "Personalized learning experiences powered by adaptive AI that evolves with your pace.";
  const ctaText = (content.ctaText as string) || "Start Learning";
  const secondaryCtaText = (content.secondaryCtaText as string) || "Explore Courses";

  function handleContentChange(key: string, value: string) {
    if (!blockId) return;
    updateSection(blockId, { content: { ...content, [key]: value } });
  }

  function renderTitle() {
    if (!devModeEnabled) {
      const parts = title.split(".");
      return (
        <span className="flex flex-col gap-2">
          <span className="text-foreground text-tight">{parts[0]}.</span>
          <span className="gradient-text-accent text-pacing">{parts[1] || "Built for the Future."}</span>
        </span>
      );
    }

    return (
      <InlineEditor
        value={title}
        onChange={(v) => handleContentChange("title", v)}
        className="text-tight"
      />
    );
  }

  function renderSubtitle() {
    if (!devModeEnabled) {
      return <span className="text-muted-foreground/80 leading-relaxed">{subtitle}</span>;
    }

    return (
      <InlineEditor
        value={subtitle}
        onChange={(v) => handleContentChange("subtitle", v)}
        className=""
        multiline
      />
    );
  }

  return (
    <section className="noise relative flex min-h-[90vh] items-center overflow-hidden px-6 pb-20 pt-32">
      {/* Layer 0: Atmospheric Background - optimized */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {/* Gradient Mesh - reduced blur values for performance */}
          <motion.div
            style={{ x: mounted ? parallaxX : 0, y: mounted ? parallaxY : 0 }}
            className="absolute inset-0 will-change-transform"
          >
          <div className="absolute -left-1/4 -top-1/4 h-[600px] w-[600px] rounded-full bg-blue-200/15 dark:bg-blue-500/5 blur-[100px]" />
          <div className="absolute -bottom-1/4 -right-1/4 h-[500px] w-[500px] rounded-full bg-purple-200/12 dark:bg-purple-500/4 blur-[100px]" />
          <div className="absolute left-1/3 top-1/2 h-[400px] w-[400px] rounded-full bg-cyan-200/10 dark:bg-cyan-500/3 blur-[80px]" />
        </motion.div>

        {/* Existing glowing orbs - reduced blur */}
        <div className="absolute -left-1/4 -top-1/4 h-[600px] w-[600px] rounded-full bg-secondary-500/5 blur-[100px]" />
        <div className="absolute -right-1/4 -bottom-1/4 h-[600px] w-[600px] rounded-full bg-accent-500/5 blur-[100px]" />

        {/* Floating Particles - reduced count */}
        <div className="absolute inset-0 opacity-20 will-change-transform">
          {[...Array(PARTICLE_COUNT)].map((_, i) => (
            <motion.div
              key={i}
              style={{ x: mounted ? parallaxX : 0, y: mounted ? parallaxY : 0 }}
              className="will-change-transform"
            >
              <motion.div
                className="absolute h-1 w-1 rounded-full bg-primary-400"
                animate={{
                  y: [0, -80 + i * 10, 0],
                  x: [0, Math.sin(i * 2) * 40, 0],
                  opacity: [0, 0.8, 0],
                }}
                transition={{
                  duration: 10 + i * 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 1.5,
                }}
                style={{
                  left: `${10 + i * 18}%`,
                  top: `${15 + (i % 3) * 22}%`,
                }}
              />
            </motion.div>
          ))}
        </div>

        {/* Ambient Nodes - reduced count */}
        <div className="absolute inset-0 opacity-25 will-change-transform">
          {[...Array(NODE_COUNT)].map((_, i) => (
            <motion.div
              key={`node-${i}`}
              style={{ x: mounted ? parallaxX : 0, y: mounted ? parallaxY : 0 }}
              className="will-change-transform"
            >
              <motion.div
                className="absolute h-1.5 w-1.5 rounded-full bg-primary-300/50 dark:bg-primary-400/30"
                animate={{
                  y: [0, -40 + i * 15, 0],
                  x: [0, 20 + i * 10, 0],
                  opacity: [0.2, 0.6, 0.2],
                }}
                transition={{
                  duration: 12 + i * 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 3,
                }}
                style={{
                  left: `${25 + i * 25}%`,
                  top: `${30 + (i % 2) * 25}%`,
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Layer 1: Cursor-responsive spotlight - simplified */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-[1] opacity-30 will-change-transform"
        style={{
          background: `radial-gradient(circle 400px at var(--x) var(--y), rgba(79,124,255,0.08), transparent 80%)`,
          // @ts-expect-error: Framer motion custom properties
          "--x": springX,
          "--y": springY,
        }}
      />

      {/* Data flow lines — adaptive network */}
      <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
        <svg className="absolute left-[52%] top-0 h-full w-[48%]" viewBox="0 0 400 800" preserveAspectRatio="none">
          <defs>
            <linearGradient id="line1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="25%" stopColor="var(--color-primary)" stopOpacity="0.12" />
              <stop offset="60%" stopColor="var(--color-accent)" stopOpacity="0.10" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
            <linearGradient id="line2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="30%" stopColor="var(--color-primary)" stopOpacity="0.06" />
              <stop offset="70%" stopColor="var(--color-accent)" stopOpacity="0.08" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <motion.path
            d="M 200 0 Q 260 200 180 400 Q 100 600 200 800"
            stroke="url(#line1)"
            strokeWidth="0.75"
            fill="none"
            strokeDasharray="4 8"
            animate={{ strokeDashoffset: [0, -120] }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          />
          <motion.path
            d="M 240 0 Q 160 250 220 500 Q 280 650 180 800"
            stroke="url(#line2)"
            strokeWidth="0.5"
            fill="none"
            strokeDasharray="3 10"
            animate={{ strokeDashoffset: [0, -130] }}
            transition={{ duration: 9, repeat: Infinity, ease: "linear", delay: 1.5 }}
          />
          <motion.path
            d="M 170 0 Q 200 150 250 300 Q 150 500 200 700 Q 220 780 170 800"
            stroke="url(#line2)"
            strokeWidth="0.4"
            fill="none"
            strokeDasharray="2 6"
            animate={{ strokeDashoffset: [0, -80] }}
            transition={{ duration: 7, repeat: Infinity, ease: "linear", delay: 3 }}
          />
        </svg>
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col items-center gap-16 lg:flex-row lg:items-center lg:justify-between lg:px-12">
        {/* Left Side: Emotional Copy */}
        <div className="z-10 flex max-w-2xl flex-col items-center gap-8 text-center lg:items-start lg:text-left lg:translate-x-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-primary-500/10 px-4 py-1.5 text-[11px] font-bold tracking-[0.2em] uppercase text-primary-400"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Adaptive Intelligence
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="font-heading text-5xl leading-[1.05] tracking-tighter sm:text-7xl lg:text-[84px] text-balance"
          >
            {renderTitle()}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-[460px] text-lg leading-relaxed text-muted-foreground/90 md:text-xl"
          >
            {renderSubtitle()}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap items-center gap-6"
          >
            <Link
              href="/signup"
              className="group relative inline-flex h-14 items-center gap-3 overflow-hidden rounded-2xl bg-foreground px-8 text-base font-bold text-background transition-all hover:scale-[1.02] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.3)] active:scale-[0.98]"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <span className="relative z-10">{ctaText}</span>
              <ArrowRight className="relative z-10 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/courses"
              className="glass glass-hover h-14 rounded-2xl px-8 flex items-center text-base font-semibold text-foreground transition-all duration-300 border-white/5 shadow-xl"
            >
              {secondaryCtaText}
            </Link>
          </motion.div>
        </div>

        {/* Right Side: Structured Visual Ecosystem */}
        <div className="relative z-10 hidden h-[700px] w-full max-w-[700px] items-center justify-center lg:flex">
          {/* Ghost Panel 1 — behind main panel, left offset */}
          <motion.div
            style={{ x: mounted ? parallaxX : 0, y: mounted ? parallaxY : 0 }}
            className="glass-ghost absolute left-[5%] top-[12%] h-[400px] w-[480px] -translate-x-1/2 -translate-y-1/2 will-change-transform"
          />

          {/* Ghost Panel 2 — behind main panel, right offset */}
          <motion.div
            style={{ x: mounted ? parallaxX : 0, y: mounted ? parallaxY : 0 }}
            className="glass-ghost absolute right-[5%] bottom-[10%] h-[350px] w-[440px] translate-x-1/2 translate-y-1/2 will-change-transform"
          />

          {/* Central Focal Point: Adaptive Dashboard */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{
              x: mounted ? parallaxX : 0,
              y: mounted ? parallaxY : 0,
              willChange: "transform",
            }}
            className="glass-hero-panel relative h-[480px] w-[560px] overflow-hidden rounded-[40px]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-bl from-white/40 via-transparent to-transparent opacity-70 dark:from-white/5" />
            <div className="flex h-full flex-col p-10">
              <div className="flex items-center justify-between mb-10">
                <div className="flex gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500/40" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/40" />
                  <div className="h-3 w-3 rounded-full bg-green-500/40" />
                </div>
                <div className="h-7 w-36 rounded-full bg-white/10 dark:bg-white/5 border border-white/10 dark:border-white/5" />
              </div>
              
              <div className="space-y-6">
                <div className="h-10 w-2/3 rounded-2xl bg-white/15 dark:bg-white/8" />
                <div className="grid grid-cols-2 gap-6">
                  <div className="group relative h-40 rounded-2xl bg-primary-500/15 dark:bg-primary-500/10 border border-primary-500/20 overflow-hidden">
                    <motion.div 
                      animate={{ opacity: [0.2, 0.5, 0.2] }}
                      transition={{ duration: 4, repeat: Infinity }}
                      className="absolute inset-0 bg-primary-500/5" 
                    />
                    <div className="absolute inset-x-6 bottom-6 space-y-2">
                      <div className="h-3 w-20 rounded-full bg-primary-400/30" />
                      <div className="h-4 w-12 rounded-full bg-primary-400/50" />
                    </div>
                  </div>
                  <div className="h-40 rounded-2xl bg-white/15 dark:bg-white/8" />
                </div>
                <div className="h-28 w-full rounded-2xl bg-white/15 dark:bg-white/8 flex items-center px-8 gap-4">
                  <div className="h-12 w-12 rounded-full bg-accent-500/15 dark:bg-accent-500/10 border border-accent-500/20" />
                  <div className="space-y-2 flex-1">
                    <div className="h-3 w-1/2 rounded-full bg-white/25 dark:bg-white/10" />
                    <div className="h-2 w-1/3 rounded-full bg-white/15 dark:bg-white/5" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Orbiting Elements */}

          {/* AI Knowledge Node */}
          <motion.div
            style={{ x: mounted ? parallaxX : 0, y: mounted ? parallaxY : 0, willChange: "transform" }}
          >
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="glass-hero-card absolute -left-4 top-12 h-36 w-36 rounded-[32px] p-8 flex flex-col items-center justify-center gap-3"
            >
              <div className="h-12 w-12 rounded-2xl bg-accent-500/20 flex items-center justify-center border border-accent-500/30 relative">
                <Sparkles className="h-6 w-6 text-accent-400 relative z-10" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent-400">AI Engine</span>
            </motion.div>
          </motion.div>

          {/* Adaptive Progress */}
          <motion.div
            style={{ x: mounted ? parallaxX : 0, y: mounted ? parallaxY : 0, willChange: "transform" }}
          >
            <motion.div
              animate={{ y: [0, 20, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="glass-hero-card absolute -right-6 bottom-24 h-44 w-48 rounded-[32px] p-8"
            >
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4">Adaptive Path</div>
              <div className="h-2.5 w-full rounded-full bg-white/10 dark:bg-white/5 mb-6 overflow-hidden border border-white/10 dark:border-white/5">
                <motion.div 
                  animate={{ width: ["10%", "85%"] }}
                  transition={{ duration: 3, delay: 1.5, ease: "circOut" }}
                  className="h-full bg-gradient-to-r from-primary-500 to-accent-500" 
                />
              </div>
              <div className="space-y-3">
                <div className="h-3 w-3/4 rounded-full bg-white/20 dark:bg-white/10" />
                <div className="h-3 w-1/2 rounded-full bg-white/10 dark:bg-white/5" />
              </div>
            </motion.div>
          </motion.div>

          {/* Analytics Pulse */}
          <motion.div
            style={{ x: mounted ? parallaxX : 0, y: mounted ? parallaxY : 0, willChange: "transform" }}
          >
            <motion.div
              animate={{ scale: [1, 1.01, 1] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="glass-hero-card absolute left-12 -bottom-4 h-28 w-56 rounded-[24px] px-8 py-6 flex items-center gap-6"
            >
              <div className="relative h-12 w-2">
                <div className="absolute inset-0 bg-white/20 dark:bg-white/10 rounded-full" />
                <motion.div 
                  animate={{ height: ["20%", "80%", "40%"] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute bottom-0 w-full bg-gradient-to-t from-primary-500 to-accent-500 rounded-full shadow-[0_0_15px_rgba(79,124,255,0.5)]" 
                />
              </div>
              <div className="space-y-1.5">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Efficiency</div>
                <div className="text-2xl font-bold tracking-tight text-foreground">+98.4%</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Ambient base glow */}
          <div className="absolute inset-0 -z-10 pointer-events-none">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] bg-primary-500/5 blur-[120px] rounded-full" />
          </div>
        </div>
      </div>

      {/* Section Transition Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background via-background/20 to-transparent z-20 pointer-events-none" />
    </section>
  );
}
