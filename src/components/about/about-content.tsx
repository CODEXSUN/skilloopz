"use client";

import { ArrowRight, Sparkles, Target, Eye, Heart, Zap, Globe, Shield } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const easing = [0.16, 1, 0.3, 1] as const;

const values = [
  {
    icon: <Target className="h-6 w-6" />,
    title: "Adaptive by Design",
    description: "Learning shouldn't be one-size-fits-all. We build systems that mold to each learner's unique pace and style.",
  },
  {
    icon: <Heart className="h-6 w-6" />,
    title: "Human-Centered",
    description: "Technology should serve people, not the other way around. Every feature starts with a human need.",
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Lightning Fast",
    description: "Performance is a feature. We obsess over speed so nothing comes between learners and knowledge.",
  },
  {
    icon: <Globe className="h-6 w-6" />,
    title: "Globally Accessible",
    description: "Quality education should reach every corner of the world. We design for offline, low-bandwidth, and every device.",
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Privacy First",
    description: "Learner data belongs to learners. We build with privacy, security, and transparency at our core.",
  },
  {
    icon: <Sparkles className="h-6 w-6" />,
    title: "AI for Good",
    description: "We harness AI to amplify human potential — not replace it. Every algorithm is guided by pedagogical expertise.",
  },
];

const stats = [
  { number: "10,000+", label: "Active Learners" },
  { number: "500+", label: "Courses" },
  { number: "50+", label: "Countries" },
  { number: "98%", label: "Satisfaction Rate" },
];

export function AboutContent() {
  return (
    <main className="bg-background text-foreground">
      {/* ───── HERO ───── */}
      <section className="noise aurora-cinematic relative flex min-h-[80vh] items-center overflow-hidden px-6 pb-20 pt-32">
        <div className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute -left-1/4 -top-1/4 h-[800px] w-[800px] rounded-full bg-primary-500/10 blur-[160px] animate-pulse-glow" />
          <div className="absolute -right-1/4 -bottom-1/4 h-[800px] w-[800px] rounded-full bg-accent-500/8 blur-[160px] animate-pulse-glow" style={{ animationDelay: "2.5s" }} />
          <div className="absolute inset-0 opacity-15">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute h-1 w-1 rounded-full bg-primary-400"
                animate={{ y: [0, -100, 0], x: [0, Math.sin(i * 1.5) * 50, 0], opacity: [0, 1, 0] }}
                transition={{ duration: 10 + i * 2, repeat: Infinity, ease: "linear", delay: i * 1.5 }}
                style={{ left: `${12 + i * 14}%`, top: `${20 + (i % 3) * 20}%` }}
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
            About skilloopz
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: easing }}
            className="font-heading text-hero font-bold tracking-tight sm:text-hero-xl text-balance max-w-5xl"
          >
            Learning should adapt{" "}
            <span className="gradient-text-accent">to humans</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: easing }}
            className="max-w-2xl text-lg leading-relaxed text-muted-foreground/90 sm:text-xl"
          >
            We believe education should mold to each learner — not the other way around. skilloopz is built from the ground up to make adaptive, personalized learning accessible to everyone.
          </motion.p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background via-background/20 to-transparent z-20 pointer-events-none" />
      </section>

      {/* ───── MISSION ───── */}
      <section className="relative overflow-hidden px-6 py-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(79,124,255,0.04)_0%,transparent_60%)]" />

        <div className="mx-auto max-w-6xl">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={{ visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: easing } } }}
            >
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-primary-400">
                Our Mission
              </p>
              <h2 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl leading-[1.1]">
                Education that{" "}
                <span className="gradient-text-accent">evolves</span> with you
              </h2>
              <div className="mt-8 space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  skilloopz was founded on a simple idea: every learner is unique, so every learning experience should be too. Traditional education forces everyone through the same path — we believe technology can do better.
                </p>
                <p>
                  Our platform combines cutting-edge AI with deep pedagogical research to create learning experiences that adapt in real-time. From lesson pacing to content difficulty, every aspect adjusts to each learner.
                </p>
                <p>
                  We&apos;re building the infrastructure for the next generation of education — one that&apos;s personalized, accessible, and truly effective.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={{ visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: easing } } }}
              className="relative"
            >
              <div className="glass-thick rounded-[40px] p-10 shadow-2xl">
                <div className="flex items-center gap-3 mb-8">
                  <div className="flex gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500/40" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500/40" />
                    <div className="h-3 w-3 rounded-full bg-green-500/40" />
                  </div>
                </div>
                <blockquote className="text-lg leading-relaxed text-foreground/90">
                  &ldquo;Humans should not adapt to systems. Systems should adapt to humans.&rdquo;
                </blockquote>
                <p className="mt-6 text-sm text-muted-foreground">— The skilloopz philosophy</p>
              </div>
              <div className="absolute -bottom-4 -right-4 -z-10 h-48 w-48 rounded-full bg-primary-500/10 blur-[80px]" />
              <div className="absolute -top-4 -left-4 -z-10 h-48 w-48 rounded-full bg-accent-500/10 blur-[80px]" />
            </motion.div>
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
              {stats.map((stat, i) => (
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

      {/* ───── VALUES ───── */}
      <section className="relative overflow-hidden px-6 py-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(79,124,255,0.06)_0%,transparent_60%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(61,217,255,0.04)_0%,transparent_60%)]" />

        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{ visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easing } } }}
            className="mb-16 text-center"
          >
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-primary-400">
              Our Values
            </p>
            <h2 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl text-balance">
              What we{" "}
              <span className="gradient-text-accent">believe</span>
            </h2>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={{
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.6, delay: i * 0.1, ease: easing },
                  },
                }}
                whileHover={{ y: -6, transition: { duration: 0.3 } }}
                className="group relative overflow-hidden rounded-[32px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-8 shadow-2xl transition-all duration-500 hover:border-[rgba(255,255,255,0.12)] hover:shadow-primary-500/10"
              >
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary-500/5 blur-[80px] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                <div className="relative z-10 flex flex-col gap-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-primary-400 shadow-lg transition-all duration-300 group-hover:border-primary-500/20 group-hover:bg-primary-500/10 group-hover:text-primary-300">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-bold text-foreground tracking-tight">{value.title}</h3>
                  <p className="leading-relaxed text-muted-foreground">{value.description}</p>
                </div>
              </motion.div>
            ))}
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
              Join us in reshaping{" "}
              <span className="gradient-text-accent">education</span>
            </h2>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
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
