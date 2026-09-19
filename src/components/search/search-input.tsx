"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, ArrowRight, BookOpen, User as UserIcon, FileText, Tag, Grid3X3, X } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface SearchCourse {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  difficulty: string;
  subject: string | null;
  teacher: { fullName: string | null } | null;
}

interface SearchTeacher {
  id: string;
  fullName: string | null;
  email: string | null;
}

interface SearchLesson {
  id: string;
  title: string;
  module: { title: string; course: { title: string } };
}

interface SearchTag {
  id: string;
  name: string;
  slug: string;
}

interface SearchCategory {
  id: string;
  name: string;
  slug: string;
}

interface SearchResults {
  courses: SearchCourse[];
  lessons: SearchLesson[];
  teachers: SearchTeacher[];
  tags: SearchTag[];
  categories: SearchCategory[];
}

export function SearchInput() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) { setResults(null); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (res.ok) setResults(await res.json());
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => doSearch(query), 250);
    return () => clearTimeout(timer);
  }, [query, doSearch]);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  const totalResults = results
    ? results.courses.length + results.lessons.length + results.teachers.length + results.tags.length + results.categories.length
    : 0;

  return (
    <div ref={ref} className="relative">
      <div className="flex h-9 w-48 items-center gap-2 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-3 transition-all focus-within:w-64 focus-within:border-primary-500/30 focus-within:bg-[rgba(79,124,255,0.06)] lg:w-56">
        <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search..."
          className="flex-1 bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground/40"
        />
        {query && (
          <button onClick={() => { setQuery(""); setResults(null); }} className="text-muted-foreground/30 hover:text-foreground">
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {open && query.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-full mt-2 w-80 overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(10,12,16,0.98)] shadow-2xl backdrop-blur-xl"
          >
            {loading ? (
              <div className="px-4 py-6 text-center text-xs text-muted-foreground/50">Searching...</div>
            ) : totalResults === 0 ? (
              <div className="px-4 py-6 text-center text-xs text-muted-foreground/50">No results found</div>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                {results?.courses && results.courses.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between px-4 pb-1 pt-3">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/40">Courses</p>
                      <span className="text-[10px] text-muted-foreground/30">{results.courses.length}</span>
                    </div>
                    {results.courses.slice(0, 4).map((c) => (
                      <Link
                        key={c.id}
                        href={`/courses/${c.id}`}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-[rgba(255,255,255,0.04)]"
                      >
                        <BookOpen className="h-4 w-4 shrink-0 text-primary-400" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">{c.title}</p>
                          <p className="truncate text-xs text-muted-foreground/60">
                            {c.teacher?.fullName ?? "Unknown"} · {c.difficulty}
                          </p>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/30" />
                      </Link>
                    ))}
                  </div>
                )}

                {results?.lessons && results.lessons.length > 0 && (
                  <div className="border-t border-[rgba(255,255,255,0.06)]">
                    <div className="flex items-center justify-between px-4 pb-1 pt-3">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/40">Lessons</p>
                      <span className="text-[10px] text-muted-foreground/30">{results.lessons.length}</span>
                    </div>
                    {results.lessons.slice(0, 3).map((l) => (
                      <Link
                        key={l.id}
                        href={`/lessons/${l.id}`}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-[rgba(255,255,255,0.04)]"
                      >
                        <FileText className="h-4 w-4 shrink-0 text-emerald-400" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">{l.title}</p>
                          <p className="truncate text-xs text-muted-foreground/60">{l.module.course.title}</p>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/30" />
                      </Link>
                    ))}
                  </div>
                )}

                {results?.teachers && results.teachers.length > 0 && (
                  <div className="border-t border-[rgba(255,255,255,0.06)]">
                    <div className="flex items-center justify-between px-4 pb-1 pt-3">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/40">Teachers</p>
                      <span className="text-[10px] text-muted-foreground/30">{results.teachers.length}</span>
                    </div>
                    {results.teachers.slice(0, 3).map((t) => (
                      <div key={t.id} className="flex items-center gap-3 px-4 py-2.5">
                        <UserIcon className="h-4 w-4 shrink-0 text-accent-400" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">{t.fullName ?? "Unknown"}</p>
                          <p className="truncate text-xs text-muted-foreground/60">{t.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {results?.tags && results.tags.length > 0 && (
                  <div className="border-t border-[rgba(255,255,255,0.06)]">
                    <div className="flex items-center justify-between px-4 pb-1 pt-3">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/40">Tags</p>
                      <span className="text-[10px] text-muted-foreground/30">{results.tags.length}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 px-4 pb-3">
                      {results.tags.slice(0, 6).map((t) => (
                        <Link
                          key={t.id}
                          href={`/courses?tag=${t.slug}`}
                          onClick={() => setOpen(false)}
                          className="inline-flex items-center gap-1 rounded-md border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-2 py-1 text-xs text-muted-foreground transition-colors hover:border-primary-500/30 hover:text-primary-400"
                        >
                          <Tag className="h-3 w-3" />
                          {t.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {results?.categories && results.categories.length > 0 && (
                  <div className="border-t border-[rgba(255,255,255,0.06)]">
                    <div className="flex items-center justify-between px-4 pb-1 pt-3">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/40">Categories</p>
                      <span className="text-[10px] text-muted-foreground/30">{results.categories.length}</span>
                    </div>
                    {results.categories.slice(0, 3).map((c) => (
                      <Link
                        key={c.id}
                        href={`/courses?category=${c.slug}`}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-[rgba(255,255,255,0.04)]"
                      >
                        <Grid3X3 className="h-4 w-4 shrink-0 text-violet-400" />
                        <p className="text-sm font-medium text-foreground">{c.name}</p>
                        <ArrowRight className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground/30" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
