"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { SkilloopzLogo } from "@/components/branding/skilloop-logo";

interface AuthSplitLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthSplitLayout({ children, title, subtitle }: AuthSplitLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {/* ───── LEFT: Branding + Atmosphere ───── */}
      <div className="noise aurora-cinematic relative hidden w-1/2 flex-col items-center justify-center overflow-hidden p-12 lg:flex">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-1/4 -top-1/4 h-[1000px] w-[1000px] rounded-full bg-primary-500/10 blur-[180px] animate-pulse-glow" />
          <div className="absolute -bottom-1/4 -right-1/4 h-[800px] w-[800px] rounded-full bg-accent-500/8 blur-[160px] animate-pulse-glow" style={{ animationDelay: "2.5s" }} />
          <div className="absolute inset-0 opacity-20">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute h-1.5 w-1.5 rounded-full bg-primary-400"
                animate={{ y: [0, -120, 0], x: [0, Math.sin(i * 1.5) * 60, 0], opacity: [0, 0.8, 0] }}
                transition={{ duration: 12 + i * 2, repeat: Infinity, ease: "linear", delay: i * 1.5 }}
                style={{ left: `${10 + i * 11}%`, top: `${15 + (i % 4) * 18}%` }}
              />
            ))}
          </div>
        </div>

        <div className="relative z-10 flex flex-col items-center gap-10 text-center max-w-lg">
          <Link href="/">
            <SkilloopzLogo />
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="glass-thick rounded-[32px] p-8 shadow-2xl"
          >
            <p className="text-lg leading-relaxed text-foreground/90">
              &ldquo;Learning should adapt to humans. Humans should not adapt to systems.&rdquo;
            </p>
            <p className="mt-6 text-sm text-muted-foreground">— The skilloopz philosophy</p>
          </motion.div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary-400" />
            <span>Adaptive AI learning platform</span>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background via-background/20 to-transparent pointer-events-none" />
      </div>

      {/* ───── RIGHT: Form ───── */}
      <div className="relative flex w-full items-center justify-center px-6 lg:w-1/2">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(79,124,255,0.05)_0%,transparent_60%)]" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-md"
        >
          <div className="mb-6 lg:hidden">
            <Link href="/">
              <SkilloopzLogo compact />
            </Link>
          </div>

          <Link
            href="/"
            className="mb-6 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
            Back to home
          </Link>

          <div className="mb-8">
            <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
              {title}
            </h1>
            <p className="mt-2 text-muted-foreground">{subtitle}</p>
          </div>

          {children}
        </motion.div>
      </div>
    </div>
  );
}
