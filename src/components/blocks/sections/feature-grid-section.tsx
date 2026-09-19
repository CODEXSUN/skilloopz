"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";
import { InlineEditor } from "@/components/dev-mode/InlineEditor";
import { usePageBuilderStore } from "@/stores/pageBuilderStore";
import { useDevModeStore } from "@/stores/devModeStore";

interface FeatureCard {
  title?: string;
  description?: string;
  icon?: string;
}

const iconMap: Record<string, string> = {
  brain: "🧠",
  rocket: "🚀",
  target: "🎯",
  star: "⭐",
  lightning: "⚡",
  shield: "🛡️",
  book: "📚",
  chart: "📈",
  globe: "🌍",
  puzzle: "🧩",
};

function useSubtleParallax(strength: number) {
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const springX = useSpring(mouseX, { stiffness: 80, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 80, damping: 30 });
  const ref = useRef<HTMLDivElement>(null);

  const handleMouse = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  const x = useTransform(springX, (v) => (v - 0.5) * strength);
  const y = useTransform(springY, (v) => (v - 0.5) * strength);

  return { ref, x, y, handleMouse };
}

export function FeatureGridSection({ content, blockId }: { content: Record<string, unknown>; blockId?: string }) {
  const devModeEnabled = useDevModeStore((s) => s.enabled);
  const updateSection = usePageBuilderStore((s) => s.updateSection);
  const cards = (content.cards as FeatureCard[]) ?? [];

  const handleCardUpdate = (index: number, key: string, value: string) => {
    if (!blockId) return;
    const newCards = [...cards];
    newCards[index] = { ...newCards[index], [key]: value };
    updateSection(blockId, { content: { ...content, cards: newCards } });
  };

  if (!cards.length) {
    return (
      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-sm text-muted-foreground">No feature cards added yet</p>
        </div>
      </section>
    );
  }

  return (
    <section id="features" className="relative overflow-hidden px-6 py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-blue-200/10 dark:bg-blue-500/5 blur-[140px] animate-ambient-float" />
        <div className="absolute right-1/4 bottom-0 h-[500px] w-[500px] translate-x-1/2 rounded-full bg-purple-200/8 dark:bg-purple-500/4 blur-[120px] animate-ambient-float" style={{ animationDelay: "-8s" }} />
      </div>

      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } },
          }}
          className="mb-16 text-center"
        >
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-primary-400">
            Features
          </p>
          <h2 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl text-foreground">
            Everything you need to learn
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 lg:grid-rows-2 gap-6">
          {cards[0] && (
            <FeatureCard
              card={cards[0]}
              className="lg:col-span-3 lg:row-span-2"
              index={0}
              onUpdate={(key, val) => handleCardUpdate(0, key, val)}
              large
              devModeEnabled={devModeEnabled}
            />
          )}
          {cards[1] && (
            <FeatureCard
              card={cards[1]}
              className="lg:col-span-3 lg:row-span-1"
              index={1}
              onUpdate={(key, val) => handleCardUpdate(1, key, val)}
              devModeEnabled={devModeEnabled}
            />
          )}
          {cards[2] && (
            <FeatureCard
              card={cards[2]}
              className="lg:col-span-2 lg:row-span-1"
              index={2}
              onUpdate={(key, val) => handleCardUpdate(2, key, val)}
              devModeEnabled={devModeEnabled}
            />
          )}
          {cards[3] && (
            <FeatureCard
              card={cards[3]}
              className="lg:col-span-1 lg:row-span-1"
              index={3}
              onUpdate={(key, val) => handleCardUpdate(3, key, val)}
              devModeEnabled={devModeEnabled}
            />
          )}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  card,
  className,
  index,
  onUpdate,
  large = false,
  devModeEnabled = false,
}: {
  card: FeatureCard;
  className?: string;
  index: number;
  onUpdate: (key: string, val: string) => void;
  large?: boolean;
  devModeEnabled?: boolean;
}) {
  const { ref, x, y, handleMouse } = useSubtleParallax(large ? 8 : 5);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.25 } }}
      style={{ x, y }}
      className={`group relative overflow-hidden rounded-[32px] p-8 transition-shadow duration-500 ${large ? "p-10" : "p-7"} ${className}`}
    >
      <div className="absolute inset-0 glass-hero-panel" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/8 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary-500/8 blur-[80px] opacity-0 transition-all duration-700 group-hover:opacity-100 group-hover:scale-110" />
      <div className="absolute -left-20 -bottom-20 h-48 w-48 rounded-full bg-accent-500/6 blur-[60px] opacity-0 transition-all duration-700 group-hover:opacity-100" style={{ transitionDelay: "100ms" }} />

      <div className="relative z-10 flex h-full flex-col justify-between gap-6">
        <div className="flex flex-col gap-5">
          <motion.div
            whileHover={{ rotate: 8, scale: 1.08 }}
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-500/10 dark:bg-primary-500/15 border border-primary-500/20 shadow-lg transition-all duration-300 group-hover:bg-primary-500/15 group-hover:border-primary-500/30 group-hover:shadow-primary-500/20"
          >
            <span className="text-xl">{iconMap[card.icon ?? ""] || "✨"}</span>
          </motion.div>
          <div>
            <h3 className={`${large ? "text-2xl" : "text-lg"} font-bold text-foreground mb-2`}>
              {devModeEnabled ? (
                <InlineEditor
                  value={card.title || "Feature"}
                  onChange={(v) => onUpdate("title", v)}
                />
              ) : (card.title || "Feature")}
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground/80">
              {devModeEnabled ? (
                <InlineEditor
                  value={card.description || ""}
                  onChange={(v) => onUpdate("description", v)}
                  multiline
                />
              ) : card.description}
            </p>
          </div>
        </div>

        {large && (
          <div className="mt-2 space-y-4">
            <div className="h-32 w-full rounded-2xl overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-accent-500/5" />
              <div className="absolute inset-0 flex items-end p-5 gap-3">
                <div className="flex-1 space-y-2">
                  <div className="flex items-end gap-1.5 h-16">
                    {[35, 55, 40, 70, 50, 80, 60].map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        whileInView={{ height: `${h}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.3 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                        className="flex-1 rounded-full bg-gradient-to-t from-primary-500/40 to-primary-400/20"
                      />
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <div className="h-2 w-12 rounded-full bg-primary-400/30" />
                  <div className="h-2 w-8 rounded-full bg-primary-400/20" />
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-1 h-2 rounded-full bg-primary-500/10 overflow-hidden">
                <motion.div
                  initial={{ width: "0%" }}
                  whileInView={{ width: "72%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500"
                />
              </div>
              <div className="flex-1 h-2 rounded-full bg-primary-500/10 overflow-hidden">
                <motion.div
                  initial={{ width: "0%" }}
                  whileInView={{ width: "45%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full rounded-full bg-gradient-to-r from-secondary-500 to-accent-400"
                />
              </div>
            </div>
          </div>
        )}

        {!large && (
          <div className="flex gap-2 items-center text-xs text-muted-foreground/60">
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="h-1.5 w-1.5 rounded-full bg-primary-400/60"
            />
            <span>Active learning node</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
