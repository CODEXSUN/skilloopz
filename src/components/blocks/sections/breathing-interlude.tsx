"use client";

import { motion } from "framer-motion";

const variants = {
  cosmic: {
    gradient: "from-purple-500/5 via-primary-500/3 to-transparent",
    orbColor: "bg-purple-500/8",
    particleBg: "bg-purple-400/30",
  },
  growth: {
    gradient: "from-emerald-500/5 via-accent-500/3 to-transparent",
    orbColor: "bg-emerald-500/8",
    particleBg: "bg-emerald-400/30",
  },
  transformation: {
    gradient: "from-primary-500/6 via-accent-500/4 to-transparent",
    orbColor: "bg-primary-500/10",
    particleBg: "bg-accent-400/30",
  },
};

export function BreathingInterlude({
  line = "Intelligence is not static. Neither are you.",
  variant = "cosmic",
}: {
  content?: Record<string, unknown>;
  blockId?: string;
  line?: string;
  variant?: "cosmic" | "growth" | "transformation";
}) {
  const v = variants[variant];

  return (
    <section className="relative flex min-h-[50vh] items-center justify-center overflow-hidden px-6 py-24">
      {/* Sparse atmospheric background */}
      <div className="pointer-events-none absolute inset-0">
        <div className={`absolute inset-0 bg-gradient-to-b ${v.gradient}`} />
        <motion.div
          className={`absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 rounded-full ${v.orbColor} blur-[160px]`}
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Minimal floating particles */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute h-0.5 w-0.5 rounded-full ${v.particleBg}`}
            style={{ left: `${25 + i * 25}%`, top: `${40 + (i % 2) * 20}%` }}
            animate={{
              y: [0, -30 - i * 8, 0],
              opacity: [0, 0.4, 0],
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 2,
            }}
          />
        ))}
      </div>

      {/* Minimal typography — the only content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="font-heading text-3xl font-light tracking-tight text-foreground/40 sm:text-4xl lg:text-5xl leading-[1.3]"
        >
          <motion.span
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            {line}
          </motion.span>
        </motion.p>

        {/* Subtle decorative line */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-8 h-px w-16 bg-gradient-to-r from-transparent via-primary-400/20 to-transparent"
        />
      </div>
    </section>
  );
}
