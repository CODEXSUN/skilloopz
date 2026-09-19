"use client";

import { ArrowRight, BrainCircuit, LayoutTemplate, Trophy, BarChart3, Wand2, Users, Download, SlidersHorizontal, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const easing = [0.16, 1, 0.3, 1] as const;

interface FeatureCard {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
  large?: boolean;
  index: number;
}

const features: Omit<FeatureCard, "index">[] = [
  {
    icon: <BrainCircuit className="h-6 w-6" />,
    title: "Adaptive AI Engine",
    description: "Learning paths that evolve with each student. Real-time adjustment of difficulty, pacing, and content based on individual performance and learning style.",
    gradient: "from-primary-500/20 via-primary-500/5 to-transparent",
  },
  {
    icon: <LayoutTemplate className="h-6 w-6" />,
    title: "Interactive Lessons",
    description: "Rich block-based content system supporting text, video, quizzes, flashcards, coding sandboxes, drag-drop, and interactive 3D elements.",
    gradient: "from-accent-500/20 via-accent-500/5 to-transparent",
    large: true,
  },
  {
    icon: <Trophy className="h-6 w-6" />,
    title: "Gamification System",
    description: "XP points, daily streaks, achievement badges, and competitive leaderboards that keep learners motivated and engaged.",
    gradient: "from-secondary-500/20 via-secondary-500/5 to-transparent",
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: "Deep Analytics",
    description: "Comprehensive tracking of progress, engagement, difficulty patterns, and learning velocity with actionable insights.",
    gradient: "from-accent-500/20 via-accent-500/5 to-transparent",
  },
  {
    icon: <Wand2 className="h-6 w-6" />,
    title: "Course Creator",
    description: "Powerful no-code tools for teachers to design, build, and publish courses with drag-drop modules, AI-assisted content generation, and instant preview.",
    gradient: "from-primary-500/20 via-primary-500/5 to-transparent",
    large: true,
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Parent Dashboard",
    description: "Real-time visibility into your child's learning journey with performance reports, screen time controls, and smart notifications.",
    gradient: "from-secondary-500/20 via-secondary-500/5 to-transparent",
  },
  {
    icon: <Download className="h-6 w-6" />,
    title: "Offline Learning",
    description: "Download lessons and continue learning without an internet connection. Progress syncs automatically when back online.",
    gradient: "from-primary-500/20 via-primary-500/5 to-transparent",
  },
  {
    icon: <SlidersHorizontal className="h-6 w-6" />,
    title: "Visual Editor",
    description: "Built-in dev mode with live preview, inline editing, responsive design controls, and a complete theme engine for full customization.",
    gradient: "from-accent-500/20 via-accent-500/5 to-transparent",
  },
];

function FeatureCard({ icon, title, description, gradient, large, index }: FeatureCard) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, delay: index * 0.1, ease: easing }}
      whileHover={{ y: -6, transition: { duration: 0.3 } }}
      className={`group relative overflow-hidden rounded-[40px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-8 shadow-2xl transition-all duration-500 hover:border-[rgba(255,255,255,0.12)] hover:shadow-primary-500/10 sm:p-10 ${large ? "lg:col-span-2 lg:row-span-1" : ""}`}
    >
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary-500/5 blur-[80px] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative z-10 flex h-full flex-col gap-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-primary-400 shadow-lg transition-all duration-300 group-hover:border-primary-500/20 group-hover:bg-primary-500/10 group-hover:text-primary-300">
          {icon}
        </div>
        <div className="flex flex-1 flex-col gap-3">
          <h3 className={`${large ? "text-2xl" : "text-xl"} font-bold text-foreground tracking-tight`}>
            {title}
          </h3>
          <p className="leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export function FeaturesContent() {
  return (
    <main className="bg-background text-foreground">
      {/* ───── HERO ───── */}
      <section className="noise aurora-cinematic relative flex min-h-[85vh] items-center overflow-hidden px-6 pb-20 pt-32">
        <div className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute -left-1/4 -top-1/4 h-[800px] w-[800px] rounded-full bg-primary-500/10 blur-[160px] animate-pulse-glow" />
          <div className="absolute -right-1/4 -bottom-1/4 h-[800px] w-[800px] rounded-full bg-accent-500/8 blur-[160px] animate-pulse-glow" style={{ animationDelay: "2.5s" }} />
          <div className="absolute inset-0 opacity-15">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute h-1 w-1 rounded-full bg-primary-400"
                animate={{
                  y: [0, -120, 0],
                  x: [0, Math.sin(i * 1.5) * 60, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 12 + i * 2,
                  repeat: Infinity,
                  ease: "linear",
                  delay: i * 1.2,
                }}
                style={{
                  left: `${10 + i * 11}%`,
                  top: `${15 + (i % 4) * 18}%`,
                }}
              />
            ))}
          </div>
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col items-center gap-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: easing }}
            className="inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-primary-500/10 px-4 py-1.5 text-[11px] font-bold tracking-[0.2em] uppercase text-primary-400"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Everything NEOT
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: easing }}
            className="font-heading text-hero font-bold tracking-tight sm:text-hero-xl text-balance max-w-5xl"
          >
            Features built for{" "}
            <span className="gradient-text-accent">the future of learning</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: easing }}
            className="max-w-2xl text-lg leading-relaxed text-muted-foreground/90 sm:text-xl"
          >
            Every tool you need to create, learn, and grow — powered by adaptive AI, built for humans.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6, ease: easing }}
            className="flex flex-wrap items-center gap-6 pt-4"
          >
            <Link
              href="/signup"
              className="group relative inline-flex h-14 items-center gap-3 overflow-hidden rounded-2xl bg-foreground px-8 text-base font-bold text-background transition-all hover:scale-[1.02] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.3)] active:scale-[0.98]"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <span className="relative z-10">Get Started Free</span>
              <ArrowRight className="relative z-10 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/courses"
              className="glass glass-hover h-14 rounded-2xl px-8 flex items-center text-base font-semibold text-foreground transition-all duration-300 border-white/5 shadow-xl"
            >
              Explore Courses
            </Link>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background via-background/20 to-transparent z-20 pointer-events-none" />
      </section>

      {/* ───── FEATURES BENTO GRID ───── */}
      <section className="relative overflow-hidden px-6 py-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(79,124,255,0.06)_0%,transparent_60%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(61,217,255,0.04)_0%,transparent_60%)]" />

        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easing } },
            }}
            className="mb-16 text-center"
          >
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-primary-400">
              Capabilities
            </p>
            <h2 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl text-balance">
              Everything you need to{" "}
              <span className="gradient-text-accent">succeed</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground/80 max-w-2xl mx-auto">
              A complete ecosystem designed for learners, teachers, and parents.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <FeatureCard key={feature.title} {...feature} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ───── STATS ───── */}
      <section className="relative overflow-hidden px-6 py-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(79,124,255,0.05)_0%,transparent_60%)]" />

        <div className="mx-auto max-w-6xl">
          <div className="glass-card relative overflow-hidden border-dashed">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(79,124,255,0.08)_0%,transparent_60%)]" />

            <div className="relative z-10 grid divide-y divide-[rgba(255,255,255,0.06)] sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
              {[
                { number: "10,000+", label: "Active Learners" },
                { number: "500+", label: "Courses Available" },
                { number: "15+", label: "Interactive Block Types" },
                { number: "99.9%", label: "Platform Uptime" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                  variants={{
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.5, delay: i * 0.15, ease: easing },
                    },
                  }}
                  className="flex flex-col items-center gap-2 px-8 py-10 text-center"
                >
                  <span className="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                    <span className="gradient-text-accent">{stat.number}</span>
                  </span>
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───── CTA ───── */}
      <section className="relative overflow-hidden px-6 py-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(79,124,255,0.05)_0%,transparent_70%)]" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: easing }}
          className="glass-thick relative mx-auto max-w-5xl overflow-hidden rounded-[48px] p-12 text-center sm:p-24 shadow-2xl"
        >
          <div className="noise absolute inset-0 opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-accent-500/10" />
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-primary-500/10 blur-[100px]" />
          <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-accent-500/10 blur-[100px]" />

          <div className="relative z-10 flex flex-col items-center gap-10">
            <h2 className="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-6xl max-w-2xl leading-[1.1] text-balance">
              Ready to transform how you learn?
            </h2>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/signup"
                className="group relative inline-flex h-16 items-center gap-3 overflow-hidden rounded-2xl bg-foreground px-10 text-lg font-bold text-background transition-all shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <span className="relative z-10">Get Started Free</span>
                <ArrowRight className="relative z-10 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
