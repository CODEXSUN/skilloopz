"use client";

import { useState } from "react";
import { Check, ArrowRight, Sparkles, HelpCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const easing = [0.16, 1, 0.3, 1] as const;

interface Plan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
  cta: string;
  ctaHref: string;
}

const plans: Plan[] = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started with adaptive learning.",
    features: [
      "Access to 10 free courses",
      "Basic adaptive learning",
      "Progress tracking",
      "Community support",
    ],
    cta: "Get Started",
    ctaHref: "/signup",
  },
  {
    name: "Pro",
    price: "$9.99",
    period: "/month",
    description: "Unlock the full learning experience for serious learners.",
    features: [
      "Unlimited courses",
      "Advanced AI-powered adaptation",
      "Detailed analytics & insights",
      "Offline learning access",
      "Priority support",
      "Achievement badges & certificates",
    ],
    highlighted: true,
    badge: "Most Popular",
    cta: "Start Free Trial",
    ctaHref: "/signup",
  },
  {
    name: "Family",
    price: "$19.99",
    period: "/month",
    description: "Learn together. Perfect for families with up to 5 members.",
    features: [
      "Everything in Pro",
      "Up to 5 family members",
      "Shared progress dashboard",
      "Parental controls & reports",
      "Screen time management",
      "Dedicated family support",
    ],
    cta: "Start Free Trial",
    ctaHref: "/signup",
  },
];

const compareFeatures = [
  { name: "Adaptive AI Learning", free: true, pro: true, family: true },
  { name: "Course Library", free: "10 courses", pro: "Unlimited", family: "Unlimited" },
  { name: "Progress Analytics", free: "Basic", pro: "Advanced", family: "Advanced" },
  { name: "Offline Learning", free: false, pro: true, family: true },
  { name: "Achievement Badges", free: false, pro: true, family: true },
  { name: "Certificates", free: false, pro: true, family: true },
  { name: "AI Tutor Access", free: "Limited", pro: "Full", family: "Full" },
  { name: "Family Members", free: "1", pro: "1", family: "Up to 5" },
  { name: "Parent Dashboard", free: false, pro: false, family: true },
  { name: "Priority Support", free: false, pro: true, family: true },
];

const faqs = [
  {
    q: "Can I switch plans anytime?",
    a: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.",
  },
  {
    q: "Is there a free trial for paid plans?",
    a: "Yes, all paid plans come with a 14-day free trial. No credit card required.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit cards, PayPal, and regional payment methods depending on your location.",
  },
  {
    q: "Can I cancel my subscription?",
    a: "Yes, you can cancel anytime. Your access continues until the end of the billing period.",
  },
  {
    q: "Do you offer student or school discounts?",
    a: "Yes, we offer special pricing for students, teachers, and institutions. Contact our sales team for details.",
  },
];

function CheckIcon({ value }: { value: boolean | string }) {
  if (value === true) return <Check className="h-5 w-5 text-primary-400" />;
  if (value === false) return <X className="h-5 w-5 text-muted-foreground/30" />;
  return <span className="text-sm text-muted-foreground">{value}</span>;
}

export function PricingContent() {
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <main className="bg-background text-foreground">
      {/* ───── HERO ───── */}
      <section className="noise aurora-cinematic relative flex min-h-[75vh] items-center overflow-hidden px-6 pb-20 pt-32">
        <div className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute -left-1/4 -top-1/4 h-[800px] w-[800px] rounded-full bg-primary-500/10 blur-[160px] animate-pulse-glow" />
          <div className="absolute -right-1/4 -bottom-1/4 h-[800px] w-[800px] rounded-full bg-accent-500/8 blur-[160px] animate-pulse-glow" style={{ animationDelay: "2.5s" }} />
          <div className="absolute inset-0 opacity-15">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute h-1 w-1 rounded-full bg-primary-400"
                animate={{
                  y: [0, -100, 0],
                  x: [0, Math.sin(i * 1.5) * 50, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 10 + i * 2,
                  repeat: Infinity,
                  ease: "linear",
                  delay: i * 1.5,
                }}
                style={{
                  left: `${12 + i * 14}%`,
                  top: `${20 + (i % 3) * 20}%`,
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
            Simple Pricing
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: easing }}
            className="font-heading text-hero font-bold tracking-tight sm:text-hero-xl text-balance max-w-5xl"
          >
            Pricing designed for{" "}
            <span className="gradient-text-accent">every learner</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: easing }}
            className="max-w-2xl text-lg leading-relaxed text-muted-foreground/90 sm:text-xl"
          >
            Start free, upgrade when you need more. No hidden fees, no surprises.
          </motion.p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background via-background/20 to-transparent z-20 pointer-events-none" />
      </section>

      {/* ───── PRICING CARDS ───── */}
      <section className="relative overflow-hidden px-6 pb-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(79,124,255,0.06)_0%,transparent_60%)]" />

        <div className="mx-auto max-w-6xl">
          {/* Billing Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easing } },
            }}
            className="mb-12 flex items-center justify-center gap-4"
          >
            <span className={`text-sm font-medium ${!annual ? "text-foreground" : "text-muted-foreground"}`}>
              Monthly
            </span>
            <button
              onClick={() => setAnnual(!annual)}
              className={`relative h-7 w-12 rounded-full transition-colors duration-300 ${
                annual ? "bg-primary-500" : "bg-[rgba(255,255,255,0.1)]"
              }`}
            >
              <div
                className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-lg transition-transform duration-300 ${
                  annual ? "translate-x-6" : "translate-x-0.5"
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${annual ? "text-foreground" : "text-muted-foreground"}`}>
              Annual <span className="text-primary-400">Save 20%</span>
            </span>
          </motion.div>

          {/* Cards */}
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan, i) => {
              const displayPrice = annual ? `$${Math.round(parseFloat(plan.price.replace("$", "")) * 12 * 0.8 / 12)}` : plan.price;

              return (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                  variants={{
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.6, delay: i * 0.15, ease: easing },
                    },
                  }}
                  whileHover={{ y: -6, transition: { duration: 0.3 } }}
                  className={`group relative flex flex-col overflow-hidden rounded-[32px] border p-8 shadow-2xl transition-all duration-500 ${
                    plan.highlighted
                      ? "border-primary-500/30 bg-[rgba(79,124,255,0.04)] shadow-primary-500/10"
                      : "border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]"
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute right-4 top-4 rounded-full bg-primary-500 px-4 py-1">
                      <span className="text-[11px] font-bold tracking-wide text-white">{plan.badge}</span>
                    </div>
                  )}

                  {plan.highlighted && (
                    <>
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                      <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-primary-500/10 blur-[100px]" />
                    </>
                  )}

                  <div className="relative z-10 flex flex-1 flex-col gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span className="font-heading text-5xl font-bold tracking-tight text-foreground">
                        {displayPrice}
                      </span>
                      <span className="text-sm text-muted-foreground">/{plan.period.replace("/", "")}</span>
                    </div>

                    {annual && plan.price !== "$0" && (
                      <p className="text-xs text-primary-400">
                        ${Math.round(parseFloat(plan.price.replace("$", "")) * 12 * 0.8)} billed annually
                      </p>
                    )}

                    <Link
                      href={plan.ctaHref}
                      className={`flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold transition-all duration-300 ${
                        plan.highlighted
                          ? "bg-foreground text-background hover:shadow-glow"
                          : "glass glass-hover text-foreground border border-[rgba(255,255,255,0.08)]"
                      }`}
                    >
                      {plan.cta}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>

                    <ul className="flex flex-col gap-3 border-t border-[rgba(255,255,255,0.06)] pt-6">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-3 text-sm text-muted-foreground">
                          <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary-400" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───── ENTERPRISE ───── */}
      <section className="relative overflow-hidden px-6 py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(79,124,255,0.05)_0%,transparent_70%)]" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: easing }}
          className="glass-thick relative mx-auto max-w-5xl overflow-hidden rounded-[48px] p-12 text-center sm:p-20 shadow-2xl"
        >
          <div className="noise absolute inset-0 opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-accent-500/10" />
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-primary-500/10 blur-[100px]" />
          <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-accent-500/10 blur-[100px]" />

          <div className="relative z-10 flex flex-col items-center gap-8">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-5xl max-w-2xl leading-[1.1]">
              Schools & Institutions
            </h2>
            <p className="max-w-xl text-lg text-muted-foreground/90">
              Custom pricing, dedicated support, and enterprise-grade infrastructure for schools, universities, and learning organizations.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/contact"
                className="group relative inline-flex h-14 items-center gap-2 overflow-hidden rounded-2xl bg-foreground px-8 text-base font-bold text-background transition-all hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.3)]"
              >
                <span className="relative z-10">Contact Sales</span>
                <ArrowRight className="relative z-10 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/signup"
                className="glass glass-hover h-14 rounded-2xl px-8 flex items-center text-base font-semibold text-foreground transition-all duration-300 border border-[rgba(255,255,255,0.08)] shadow-xl"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ───── COMPARISON TABLE ───── */}
      <section className="relative overflow-hidden px-6 py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(79,124,255,0.04)_0%,transparent_60%)]" />

        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easing } },
            }}
            className="mb-14 text-center"
          >
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-primary-400">
              Comparison
            </p>
            <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Find the right plan for{" "}
              <span className="gradient-text-accent">you</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easing } },
            }}
            className="glass-card overflow-hidden border-dashed"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[rgba(255,255,255,0.06)]">
                    <th className="px-6 py-5 text-left text-sm font-semibold text-foreground">Feature</th>
                    <th className="px-6 py-5 text-center text-sm font-semibold text-foreground">Free</th>
                    <th className="px-6 py-5 text-center text-sm font-semibold text-primary-400">Pro</th>
                    <th className="px-6 py-5 text-center text-sm font-semibold text-foreground">Family</th>
                  </tr>
                </thead>
                <tbody>
                  {compareFeatures.map((feat, i) => (
                    <tr
                      key={feat.name}
                      className={`border-b border-[rgba(255,255,255,0.04)] transition-colors hover:bg-[rgba(255,255,255,0.02)] ${
                        i === compareFeatures.length - 1 ? "border-b-0" : ""
                      }`}
                    >
                      <td className="flex items-center gap-2 px-6 py-4 text-sm text-muted-foreground">
                        {feat.name}
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/30" />
                      </td>
                      <td className="px-6 py-4 text-center"><CheckIcon value={feat.free} /></td>
                      <td className="px-6 py-4 text-center"><CheckIcon value={feat.pro} /></td>
                      <td className="px-6 py-4 text-center"><CheckIcon value={feat.family} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ───── FAQ ───── */}
      <section className="relative overflow-hidden px-6 py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(79,124,255,0.04)_0%,transparent_60%)]" />

        <div className="mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easing } },
            }}
            className="mb-14 text-center"
          >
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-primary-400">
              FAQ
            </p>
            <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              <span className="gradient-text">Frequently asked questions</span>
            </h2>
          </motion.div>

          <div className="flex flex-col gap-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={{
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.4, delay: i * 0.05, ease: easing },
                  },
                }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className={`glass-card group w-full text-left transition-all duration-300 ${
                    openFaq === i ? "shadow-glow-sm" : ""
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 px-6 py-5">
                    <span className="text-sm font-medium text-foreground sm:text-base">
                      {faq.q}
                    </span>
                    <motion.div
                      animate={{ rotate: openFaq === i ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <HelpCircle className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    </motion.div>
                  </div>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: easing }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-[rgba(255,255,255,0.06)] px-6 pb-5 pt-4">
                          <p className="text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
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
              Start learning today.{" "}
              <span className="gradient-text-accent">Free.</span>
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
