"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { InlineEditor } from "@/components/dev-mode/InlineEditor";
import { usePageBuilderStore } from "@/stores/pageBuilderStore";
import { useDevModeStore } from "@/stores/devModeStore";

interface FaqItem {
  question?: string;
  answer?: string;
}

export function FaqSection({ content, blockId }: { content: Record<string, unknown>; blockId?: string }) {
  const devModeEnabled = useDevModeStore((s) => s.enabled);
  const updateSection = usePageBuilderStore((s) => s.updateSection);
  const items = (content.items as FaqItem[]) ?? [];
  const [openIndex, setOpenIndex] = useState<number | null>(null);

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
          <p className="text-sm text-muted-foreground">No questions added yet</p>
        </div>
      </section>
    );
  }

  return (
    <section id="faq" className="relative overflow-hidden px-6 py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(79,124,255,0.04)_0%,transparent_60%)]" />

      <div className="mx-auto max-w-3xl">
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
            FAQ
          </p>
          <h2 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
            <span className="gradient-text">Frequently asked questions</span>
          </h2>
        </motion.div>

        <div className="flex flex-col gap-3">
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={{
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.4, delay: i * 0.05, ease: [0.25, 0.1, 0.25, 1] },
                },
              }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className={`glass-card group w-full text-left transition-all duration-300 ${
                  openIndex === i ? "shadow-glow-sm" : ""
                }`}
              >
                <div className="flex items-center justify-between gap-4 px-6 py-5">
                  <span className="text-sm font-medium text-foreground sm:text-base">
                    {devModeEnabled ? (
                      <InlineEditor
                        value={item.question || `Question ${i + 1}`}
                        onChange={(v) => handleItemUpdate(i, "question", v)}
                      />
                    ) : (item.question || `Question ${i + 1}`)}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform duration-300 ${
                      openIndex === i ? "rotate-180 text-primary-400" : ""
                    }`}
                  />
                </div>
                <AnimatePresence>
                  {openIndex === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-[rgba(255,255,255,0.06)] px-6 pb-5 pt-4">
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {devModeEnabled ? (
                            <InlineEditor
                              value={item.answer || ""}
                              onChange={(v) => handleItemUpdate(i, "answer", v)}
                              multiline
                            />
                          ) : (item.answer || "No answer provided.")}
                        </p>
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
  );
}
