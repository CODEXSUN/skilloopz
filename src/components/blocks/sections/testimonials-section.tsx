"use client";

import { motion } from "framer-motion";
import { InlineEditor } from "@/components/dev-mode/InlineEditor";
import { usePageBuilderStore } from "@/stores/pageBuilderStore";
import { useDevModeStore } from "@/stores/devModeStore";
import { Sparkles, Zap, Trophy } from "lucide-react";

interface TestimonialItem {
  name?: string;
  role?: string;
  text?: string;
  avatar?: string;
}

const badges = ["AI-Adapted", "Fast Learner", "Top 5%", "Streak: 12", "Mastered"];

export function TestimonialsSection({ content, blockId }: { content: Record<string, unknown>; blockId?: string }) {
  const devModeEnabled = useDevModeStore((s) => s.enabled);
  const updateSection = usePageBuilderStore((s) => s.updateSection);
  const items = (content.items as TestimonialItem[]) ?? [];

  const handleItemUpdate = (index: number, key: string, value: string) => {
    if (!blockId) return;
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [key]: value };
    updateSection(blockId, { content: { ...content, items: newItems } });
  };

  if (!items.length) {
    return (
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-sm text-muted-foreground">No testimonials added yet</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden px-6 py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/4 h-[400px] w-[400px] rounded-full bg-purple-200/8 dark:bg-purple-500/4 blur-[100px] animate-ambient-float" />
        <div className="absolute right-1/4 bottom-1/4 h-[350px] w-[350px] rounded-full bg-cyan-200/6 dark:bg-cyan-500/3 blur-[90px] animate-ambient-float" style={{ animationDelay: "-7s" }} />
      </div>

      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-20 text-center"
        >
          <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.2em] text-primary-400">
            Student Success
          </p>
          <h2 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl text-foreground">
            Real learners, real results
          </h2>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <TestimonialCard key={i} item={item} index={i} devModeEnabled={devModeEnabled} onUpdate={(key, val) => handleItemUpdate(i, key, val)} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ item, index, devModeEnabled, onUpdate }: { item: TestimonialItem; index: number; devModeEnabled: boolean; onUpdate: (key: string, val: string) => void }) {
  const initials = (item.name || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const badge = badges[index % badges.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="group relative overflow-hidden rounded-[28px] p-7 transition-all duration-300"
    >
      <div className="absolute inset-0 glass-hero-card" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative z-10 flex h-full flex-col gap-5">
        {/* Stars */}
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + index * 0.1 + i * 0.06 }}
              className="h-2 w-2 rounded-full bg-primary-400/60"
            />
          ))}
        </div>

        {/* Quote */}
        <p className="flex-1 text-sm leading-relaxed text-foreground/80 font-medium">
          &ldquo;{devModeEnabled ? (
            <InlineEditor value={item.text || ""} onChange={(v) => onUpdate("text", v)} multiline />
          ) : (item.text || "Great platform for learning!")}&rdquo;
        </p>

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary-500/8 border border-primary-500/12 px-3 py-1 self-start">
          {index % 3 === 0 ? <Zap className="h-3 w-3 text-accent-400" /> : index % 3 === 1 ? <Trophy className="h-3 w-3 text-amber-400" /> : <Sparkles className="h-3 w-3 text-primary-400" />}
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary-400">{badge}</span>
        </div>

        {/* Author */}
        <div className="flex items-center gap-4 pt-2 border-t border-primary-500/8">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary-500/20 to-primary-400/10 text-sm font-bold text-primary-400 border border-primary-500/20">
            {initials}
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">
              {devModeEnabled ? (
                <InlineEditor value={item.name || "User"} onChange={(v) => onUpdate("name", v)} />
              ) : (item.name || "User")}
            </p>
            {item.role && (
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {devModeEnabled ? (
                  <InlineEditor value={item.role} onChange={(v) => onUpdate("role", v)} />
                ) : item.role}
              </p>
            )}
          </div>

          {/* Streak indicator */}
          <motion.div
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
            className="ml-auto flex items-center gap-1 text-[10px] font-bold text-amber-500/60"
          >
            <Zap className="h-3 w-3" />
            <span>active</span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
