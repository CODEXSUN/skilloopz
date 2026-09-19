"use client";

import { Check, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { InlineEditor } from "@/components/dev-mode/InlineEditor";
import { usePageBuilderStore } from "@/stores/pageBuilderStore";
import { useDevModeStore } from "@/stores/devModeStore";

interface PricingPlan {
  name?: string;
  price?: string;
  description?: string;
  features?: string[];
  highlighted?: boolean;
  ctaText?: string;
}

export function PricingTableSection({ content, blockId }: { content: Record<string, unknown>; blockId?: string }) {
  const devModeEnabled = useDevModeStore((s) => s.enabled);
  const updateSection = usePageBuilderStore((s) => s.updateSection);
  const plans = (content.plans as PricingPlan[]) ?? [];

  const handlePlanUpdate = (index: number, key: string, value: string) => {
    if (!blockId) return;
    const newPlans = [...plans];
    newPlans[index] = { ...newPlans[index], [key]: value };
    updateSection(blockId, { content: { ...content, plans: newPlans } });
  };

  if (!plans.length) {
    return (
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-sm text-muted-foreground">No plans added yet</p>
        </div>
      </section>
    );
  }

  return (
    <section id="pricing" className="relative overflow-hidden px-6 py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(79,124,255,0.04)_0%,transparent_60%)]" />

      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } },
          }}
          className="mb-14 text-center"
        >
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-primary-400">
            Pricing
          </p>
          <h2 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
            <span className="gradient-text">Simple, transparent pricing</span>
          </h2>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <PricingCard key={i} plan={plan} index={i} devModeEnabled={devModeEnabled} onUpdate={(key, val) => handlePlanUpdate(i, key, val)} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingCard({ plan, index, devModeEnabled, onUpdate }: { plan: PricingPlan; index: number; devModeEnabled: boolean; onUpdate: (key: string, val: string) => void }) {
  const features = plan.features ?? [];
  const isHighlighted = plan.highlighted;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={{
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, delay: index * 0.1, ease: [0.25, 0.1, 0.25, 1] },
        },
      }}
      className={`glass-card group relative overflow-hidden p-8 transition-all duration-300 ${
        isHighlighted ? "border-primary-500/30 shadow-glow-sm" : ""
      } hover:shadow-glow-sm`}
    >
      {isHighlighted && (
        <div className="absolute right-0 top-0 rounded-bl-xl rounded-tr-xl bg-primary-500 px-3 py-1">
          <span className="text-xs font-semibold text-white">Popular</span>
        </div>
      )}

      <div className="relative z-10 flex flex-col gap-6">
        <div>
          <h3 className="mb-1 text-lg font-semibold text-foreground">
            {devModeEnabled ? (
              <InlineEditor value={plan.name || "Plan"} onChange={(v) => onUpdate("name", v)} />
            ) : (plan.name || "Plan")}
          </h3>
          {plan.description && (
            <p className="text-sm text-muted-foreground">
              {devModeEnabled ? (
                <InlineEditor value={plan.description} onChange={(v) => onUpdate("description", v)} multiline />
              ) : plan.description}
            </p>
          )}
        </div>

        <div className="flex items-baseline gap-1">
          <span className="font-heading text-4xl font-bold text-foreground">
            {devModeEnabled ? (
              <InlineEditor value={plan.price || "$0"} onChange={(v) => onUpdate("price", v)} />
            ) : (plan.price || "$0")}
          </span>
          {plan.price && !plan.price.startsWith("$0") && (
            <span className="text-sm text-muted-foreground">/month</span>
          )}
        </div>

        <Link
          href="/signup"
          className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all duration-300 ${
            isHighlighted
              ? "bg-primary-500 text-white shadow-glow-sm hover:shadow-glow"
              : "glass glass-hover text-foreground hover:text-primary-400"
          }`}
        >
          {devModeEnabled ? (
            <InlineEditor value={plan.ctaText || "Get Started"} onChange={(v) => onUpdate("ctaText", v)} />
          ) : (plan.ctaText || "Get Started")}
          <ArrowRight className="h-4 w-4" />
        </Link>

        {features.length > 0 && (
          <ul className="flex flex-col gap-3 border-t border-[rgba(255,255,255,0.06)] pt-6">
            {features.map((feature, fi) => (
              <li key={fi} className="flex items-start gap-3 text-sm text-muted-foreground">
                <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary-400" />
                {feature}
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  );
}
