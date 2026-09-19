"use client";

import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { InlineEditor } from "@/components/dev-mode/InlineEditor";
import { usePageBuilderStore } from "@/stores/pageBuilderStore";
import { useDevModeStore } from "@/stores/devModeStore";

interface StatItem {
  number?: string;
  label?: string;
  prefix?: string;
  suffix?: string;
}

function useCountUp(target: number, duration: number, enabled: boolean) {
  const [current, setCurrent] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!enabled || started.current) return;
    started.current = true;
    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [enabled, target, duration]);

  return current;
}

export function StatsBarSection({ content, blockId }: { content: Record<string, unknown>; blockId?: string }) {
  const devModeEnabled = useDevModeStore((s) => s.enabled);
  const updateSection = usePageBuilderStore((s) => s.updateSection);
  const items = (content.items as StatItem[]) ?? [];
  const [isInView, setIsInView] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const handleStatUpdate = (index: number, key: string, value: string) => {
    if (!blockId) return;
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [key]: value };
    updateSection(blockId, { content: { ...content, items: newItems } });
  };

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) queueMicrotask(() => setIsInView(true)); },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  if (!items.length) {
    return (
      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-sm text-muted-foreground">No stats added yet</p>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden px-6 py-24"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/3 top-0 h-[300px] w-[300px] rounded-full bg-blue-200/10 dark:bg-blue-500/5 blur-[100px] animate-ambient-float" />
        <div className="absolute right-1/3 bottom-0 h-[250px] w-[250px] rounded-full bg-purple-200/8 dark:bg-purple-500/4 blur-[80px] animate-ambient-float" style={{ animationDelay: "-6s" }} />
      </div>

      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-2 text-center"
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-muted-foreground/60">
            Trusted by learners worldwide
          </p>
        </motion.div>

        <div className="glass-hero-panel relative overflow-hidden rounded-[32px]">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-transparent to-accent-500/5" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent dark:from-white/5" />

          <div className="relative z-10 grid divide-y divide-[rgba(79,124,255,0.06)] sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
            {items.map((item, i) => (
              <StatCell
                key={i}
                item={item}
                index={i}
                isInView={isInView}
                devModeEnabled={devModeEnabled}
                onUpdate={(key, val) => handleStatUpdate(i, key, val)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCell({
  item,
  index,
  isInView,
  devModeEnabled,
  onUpdate,
}: {
  item: StatItem;
  index: number;
  isInView: boolean;
  devModeEnabled: boolean;
  onUpdate: (key: string, val: string) => void;
}) {
  const parsed = parseInt(item.number || "0");
  const counted = useCountUp(parsed, 2, isInView);

  // Micro trend SVG line — seeded for hydration stability
  const seed = (n: number) => {
    const x = Math.sin(index * 7.3 + n * 4.1) * 10000;
    return x - Math.floor(x);
  };
  const trendPoints = [
    [0, 25 - seed(1) * 10],
    [18, 15 + seed(2) * 15],
    [36, 20 + seed(3) * 10],
    [54, 10 + seed(4) * 12],
    [72, 18 + seed(5) * 8],
    [90, 8 + seed(6) * 8],
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      variants={{
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, delay: index * 0.12, ease: [0.25, 0.1, 0.25, 1] },
        },
      }}
      className="relative flex flex-col items-center gap-3 px-8 py-12 text-center group"
    >
      {/* Trend line */}
      <div className="absolute top-3 right-6 opacity-30 group-hover:opacity-60 transition-opacity duration-500">
        <svg width="90" height="30" viewBox="0 0 90 30" className="overflow-visible">
          <motion.path
            d={`M ${trendPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ")}`}
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, delay: 0.5 + index * 0.15, ease: [0.16, 1, 0.3, 1] }}
          />
          <motion.circle
            cx={trendPoints[trendPoints.length - 1][0]}
            cy={trendPoints[trendPoints.length - 1][1]}
            r="2"
            fill="var(--color-primary)"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 2 + index * 0.15 }}
          />
        </svg>
      </div>

      {/* Number */}
      <span className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
        <span className="gradient-text-accent">
          {item.prefix || ""}
          {devModeEnabled ? (
            <InlineEditor value={item.number || "0"} onChange={(v) => onUpdate("number", v)} />
          ) : isInView ? counted : 0}
          {item.suffix || ""}
        </span>
      </span>

      {/* Label */}
      <span className="text-sm text-muted-foreground/80 font-medium">
        {devModeEnabled ? (
          <InlineEditor value={item.label || "Stat"} onChange={(v) => onUpdate("label", v)} />
        ) : (item.label || "Stat")}
      </span>

      {/* Pulse indicator */}
      <motion.div
        animate={isInView ? { opacity: [0.3, 0.8, 0.3] } : { opacity: 0.3 }}
        transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 h-1 w-8 rounded-full bg-gradient-to-r from-primary-400/0 via-primary-400/40 to-primary-400/0"
      />

      {/* Growth arrow */}
      {isInView && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 1.5 + index * 0.15 }}
          className="absolute top-4 left-6"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" className="text-green-500/50">
            <motion.path
              d="M2 12 L8 4 L14 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 1.8 + index * 0.15 }}
            />
          </svg>
        </motion.div>
      )}
    </motion.div>
  );
}
