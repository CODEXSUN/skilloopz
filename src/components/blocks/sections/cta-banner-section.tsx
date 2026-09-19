"use client";

import { ArrowRight, Sparkles, Zap, Brain } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export function CtaBannerSection({ content, blockId }: { content: Record<string, unknown>; blockId?: string }) {
  const text = "This is what adaptive intelligence feels like.";
  const buttonText = "Enter Your Future Self";
  const buttonLink = "/login";

  return (
    <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden px-6 py-32">
      {/* Deep atmospheric climax background */}
      <div className="pointer-events-none absolute inset-0">
        {/* Giant converging glow orbs */}
        <motion.div
          className="absolute left-1/4 top-1/4 h-[700px] w-[700px] rounded-full bg-primary-500/8 blur-[200px]"
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-1/4 bottom-1/4 h-[600px] w-[600px] rounded-full bg-accent-500/6 blur-[180px]"
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <motion.div
          className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/5 blur-[160px]"
          animate={{ scale: [0.9, 1.2, 0.9], opacity: [0.1, 0.4, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        />

        {/* Grid convergence effect */}
        <div className="absolute inset-0 opacity-[0.015]">
          <div
            className="h-full w-full"
            style={{
              backgroundImage: `
                radial-gradient(circle at 50% 50%, transparent 0%, var(--background) 80%),
                linear-gradient(rgba(79,124,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(79,124,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: "100% 100%, 48px 48px, 48px 48px",
            }}
          />
        </div>

        {/* Floating energy particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`climax-p-${i}`}
            className="absolute h-0.5 w-0.5 rounded-full"
            style={{
              background: i % 3 === 0 ? "var(--color-primary)" : i % 3 === 1 ? "var(--color-accent)" : "var(--color-secondary)",
              left: `${10 + i * 11}%`,
              top: `${15 + (i % 3) * 25}%`,
            }}
            animate={{
              y: [0, -50 - i * 8, 0],
              x: [0, (i % 2 === 0 ? 15 : -15), 0],
              opacity: [0, 0.5, 0],
              scale: [0.5, 1.5, 0.5],
            }}
            transition={{
              duration: 8 + i * 0.8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.6,
            }}
          />
        ))}
      </div>

      {/* Content — full-width, not a card */}
      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center gap-12 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-primary-500/10 px-4 py-1.5 text-[11px] font-bold tracking-[0.2em] uppercase text-primary-400"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Transformation Awaits
        </motion.div>

        {/* Emotional headline — living typography */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="font-heading text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl max-w-4xl leading-[1.1]"
        >
          <span className="text-foreground">You&apos;ve seen what AI can do. </span>
          <motion.span
            className="gradient-text-accent"
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            Now see what it can make of you.
          </motion.span>
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl text-lg leading-relaxed text-muted-foreground/70"
        >
          Every interaction rewires your capabilities. Every session unlocks new potential.
          The AI doesn&apos;t just teach you — it evolves with you.
        </motion.p>

        {/* CTA with activation sequence */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-6"
        >
          <Link
            href={buttonLink}
            className="group relative inline-flex h-16 cursor-pointer items-center gap-3 rounded-2xl bg-foreground px-10 text-lg font-bold text-background shadow-lg transition-transform duration-500 will-change-transform hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98]"
          >
            <span>{buttonText}</span>
            <ArrowRight className="h-5 w-5 animate-[arrow-bounce_1.5s_ease-in-out_infinite] group-hover:[animation-play-state:paused]" />
          </Link>

          {/* Trust line */}
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="flex items-center gap-3 text-xs text-muted-foreground/40"
          >
            <Zap className="h-3 w-3 text-accent-400/60" />
            <span>No credit card required · 14-day free trial</span>
            <Brain className="h-3 w-3 text-primary-400/60" />
          </motion.div>
        </motion.div>

        {/* Bottom glow convergence */}
        <motion.div
          className="absolute -bottom-32 left-1/2 h-64 w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-t from-primary-500/8 via-accent-500/5 to-transparent blur-[120px]"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </section>
  );
}
