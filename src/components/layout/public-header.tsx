"use client";

import { useState, useEffect } from "react";
import { Menu, X, ArrowUpRight, UserRound } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "@/vite/platform/link";
import { useAuth } from "@/hooks/useAuth";
import { SkilloopzLogo } from "@/components/branding/skilloop-logo";

const navLinks = [
  { label: "Programs", href: "/#programs" },
  { label: "Learning Path", href: "/#pathway" },
  { label: "Mentors", href: "/#mentors" },
  { label: "Study Spot", href: "/#study-spot" },
  { label: "About", href: "/#about" },
];

export function PublicHeader() {
  const { user, isLoading } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [portalProgress, setPortalProgress] = useState(0);
  const [portalLocked, setPortalLocked] = useState(false);

  const portalInMotion = portalLocked && portalProgress > 0.015;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onPortalState = (event: Event) => {
      const { progress, locked } = (
        event as CustomEvent<{ progress: number; locked: boolean }>
      ).detail;
      setPortalProgress(progress);
      setPortalLocked(locked);
      if (locked && progress > 0.015) setMobileOpen(false);
    };
    window.addEventListener("abhi-portal-state", onPortalState);
    const stateFrame = window.requestAnimationFrame(() => {
      const storedProgress = Number(
        document.documentElement.dataset.abhiPortalProgress,
      );
      const storedLock = document.documentElement.dataset.abhiPortalLocked;
      if (Number.isFinite(storedProgress)) setPortalProgress(storedProgress);
      if (storedLock) setPortalLocked(storedLock === "true");
    });
    return () => {
      window.removeEventListener("abhi-portal-state", onPortalState);
      window.cancelAnimationFrame(stateFrame);
    };
  }, []);

  return (
    <motion.header
      initial={false}
      animate={{ opacity: portalInMotion ? 0 : 1, y: portalInMotion ? -16 : 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 sm:px-8 sm:pt-4"
      style={{ pointerEvents: portalInMotion ? "none" : "auto" }}
    >
      <motion.nav
        initial={false}
        animate={{
          scale: scrolled ? 0.95 : 1,
          width: scrolled ? "92%" : "100%",
        }}
        transition={{
          duration: 0.4,
          ease: [0.16, 1, 0.3, 1],
        }}
        className={`relative flex max-w-[1400px] items-center justify-between overflow-hidden rounded-2xl border px-3 shadow-[0_18px_55px_rgba(0,0,0,.18)] backdrop-blur-2xl transition-all duration-700 sm:px-5 ${
          scrolled
            ? "border-white/15 bg-[#070711]/85 py-2"
            : "border-white/10 bg-[#070711]/45 py-2.5"
        }`}
      >
        <span className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
        <Link href="/" className="px-1.5 sm:px-2">
          <SkilloopzLogo compact />
        </Link>

        <div className="hidden items-center gap-1 xl:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="relative flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-white/70 transition-all hover:bg-white/10 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center md:flex">
          <AccountAction isLoading={isLoading} user={user} />
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(!mobileOpen)}
            className="relative z-50 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/75 sm:h-10 sm:w-10"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-4 top-20 z-40 rounded-2xl border border-white/10 bg-[#090911]/95 p-6 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
              <hr className="border-white/10" />
              <AccountAction
                isLoading={isLoading}
                user={user}
                mobile
                onClick={() => setMobileOpen(false)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

function AccountAction({
  isLoading,
  mobile = false,
  onClick,
  user,
}: {
  isLoading: boolean;
  mobile?: boolean;
  onClick?: () => void;
  user: ReturnType<typeof useAuth>["user"];
}) {
  const className = mobile
    ? "flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-fuchsia-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white"
    : "group relative inline-flex items-center gap-3 overflow-hidden rounded-xl border border-white/15 bg-gradient-to-r from-fuchsia-600 via-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(117,60,255,.28)] transition-all hover:scale-[1.02] active:scale-[0.98]";

  if (isLoading) {
    return (
      <span
        className="h-10 w-28 animate-pulse rounded-xl bg-white/10"
        aria-label="Loading account"
      />
    );
  }

  if (!user) {
    return (
      <Link href="/apply" onClick={onClick} className={className}>
        {!mobile && (
          <span className="absolute inset-x-0 top-0 h-px bg-white/50" />
        )}
        <span className="relative z-10">Apply Now</span>
        <ArrowUpRight className="relative z-10 h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </Link>
    );
  }

  const firstName =
    user.fullName?.trim().split(" ")[0] ||
    user.email?.split("@")[0] ||
    "Learner";
  return (
    <Link href="/dashboard" onClick={onClick} className={className}>
      <span className="grid h-5 w-5 place-items-center rounded-full bg-white/20">
        <UserRound className="h-3 w-3" />
      </span>
      <span>Continue, {firstName}</span>
      <ArrowUpRight className="h-3.5 w-3.5" />
    </Link>
  );
}
