"use client";

import { useState, useMemo, useEffect } from "react";
import { ArrowRight, Sparkles, Search, Tag } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useCourses, type CourseListItem } from "@/hooks/useCourses";
import { CourseGrid } from "@/components/courses/course-grid";

const easing = [0.16, 1, 0.3, 1] as const;

function extractCategories(courses: CourseListItem[] | undefined) {
  const cats = new Map<string, { id: string; name: string }>();
  if (!courses) return [];
  for (const c of courses) {
    if (c.category && !cats.has(c.category.id)) {
      cats.set(c.category.id, { id: c.category.id, name: c.category.name });
    }
  }
  return Array.from(cats.values());
}

function extractTags(courses: CourseListItem[] | undefined) {
  const tags = new Map<string, { slug: string; name: string }>();
  if (!courses) return [];
  for (const c of courses) {
    for (const t of c.tags ?? []) {
      if (!tags.has(t.tag.slug)) {
        tags.set(t.tag.slug, { slug: t.tag.slug, name: t.tag.name });
      }
    }
  }
  return Array.from(tags.values());
}

interface Props {
  initialTag?: string;
}

export function CoursesContent({ initialTag }: Props) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>();
  const [selectedTag, setSelectedTag] = useState<string | undefined>(initialTag);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: courses, isLoading, error } = useCourses({
    status: "published",
    categoryId: selectedCategoryId,
    tag: selectedTag,
    search: searchQuery || undefined,
  });

  useEffect(() => {
    if (initialTag) setSelectedTag(initialTag);
  }, [initialTag]);

  const categories = useMemo(() => extractCategories(courses), [courses]);
  const tags = useMemo(() => extractTags(courses), [courses]);

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
            Explore Learning
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: easing }}
            className="font-heading text-hero font-bold tracking-tight sm:text-hero-xl text-balance max-w-5xl"
          >
            Discover courses that{" "}
            <span className="gradient-text-accent">adapt to you</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: easing }}
            className="max-w-2xl text-lg leading-relaxed text-muted-foreground/90 sm:text-xl"
          >
            Browse our library of adaptive courses powered by AI. Each course evolves with your pace, style, and goals.
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
              <span className="relative z-10">Start Learning</span>
              <ArrowRight className="relative z-10 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <div className="glass glass-hover flex h-14 items-center gap-3 rounded-2xl border border-white/5 px-5 shadow-xl">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background via-background/20 to-transparent z-20 pointer-events-none" />
      </section>

      {/* ───── CATEGORY FILTERS + COURSE GRID ───── */}
      <section className="relative overflow-hidden px-6 py-24">
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
            className="mb-12"
          >
            <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-400">
                  Course Library
                </p>
                <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
                  All{" "}
                  <span className="gradient-text-accent">courses</span>
                </h2>
                {(selectedTag || selectedCategoryId) && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    Filtered by {selectedTag && <span className="text-primary-400">#{selectedTag}</span>}
                    {selectedTag && selectedCategoryId && <span> + </span>}
                    {selectedCategoryId && <span className="text-primary-400">category</span>}
                    <button
                      onClick={() => { setSelectedTag(undefined); setSelectedCategoryId(undefined); }}
                      className="ml-2 text-xs text-muted-foreground underline hover:text-foreground"
                    >
                      Clear filters
                    </button>
                  </p>
                )}
              </div>
            </div>

            {categories.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategoryId(undefined)}
                  className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-300 ${
                    !selectedCategoryId
                      ? "bg-primary-500/20 text-primary-300 border border-primary-500/30"
                      : "glass glass-hover text-muted-foreground border border-[rgba(255,255,255,0.06)]"
                  }`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { setSelectedCategoryId(cat.id); setSelectedTag(undefined); }}
                    className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-300 ${
                      selectedCategoryId === cat.id
                        ? "bg-primary-500/20 text-primary-300 border border-primary-500/30"
                        : "glass glass-hover text-muted-foreground border border-[rgba(255,255,255,0.06)]"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}

            {tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {tags.slice(0, 12).map((t) => (
                  <button
                    key={t.slug}
                    onClick={() => { setSelectedTag(selectedTag === t.slug ? undefined : t.slug); setSelectedCategoryId(undefined); }}
                    className={`inline-flex items-center gap-1 rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-300 ${
                      selectedTag === t.slug
                        ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                        : "border border-[rgba(255,255,255,0.06)] text-muted-foreground hover:border-[rgba(255,255,255,0.15)]"
                    }`}
                  >
                    <Tag className="h-3 w-3" />
                    {t.name}
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          <CourseGrid
            courses={courses}
            isLoading={isLoading}
            error={error}
          />
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
                { number: "500+", label: "Courses" },
                { number: "15+", label: "Interactive Block Types" },
                { number: "10,000+", label: "Active Learners" },
                { number: "98%", label: "Satisfaction Rate" },
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
              Ready to start your learning journey?
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
