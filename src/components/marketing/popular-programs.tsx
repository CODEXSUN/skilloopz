"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { marketingPrograms, programCategories } from "@/lib/programs/catalog";

const AUTO_ADVANCE_MS = 3600;
const CARD_TRANSITION_SECONDS = 0.82;
const COURSE_CARD_BACKGROUNDS = [
  "/brand/course-card-cloud.png",
  "/brand/course-card-learning.png",
  "/brand/course-card-growth.png",
] as const;

export function PopularPrograms() {
  const reduceMotion = useReducedMotion();
  const [category, setCategory] = useState(programCategories[0]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const programs = marketingPrograms.filter((program) =>
    program.programGroups.includes(category),
  );

  useEffect(() => setActiveIndex(0), [category]);

  useEffect(() => {
    if (paused || reduceMotion || programs.length < 2) return;
    const interval = window.setInterval(
      () => setActiveIndex((index) => (index + 1) % programs.length),
      AUTO_ADVANCE_MS,
    );
    return () => window.clearInterval(interval);
  }, [paused, programs.length, reduceMotion]);

  const move = (direction: number) => {
    setActiveIndex(
      (index) => (index + direction + programs.length) % programs.length,
    );
  };

  return (
    <section
      id="programs"
      className="overflow-hidden px-4 py-16 sm:px-8 lg:px-12 lg:py-24"
    >
      <div className="mx-auto max-w-[1360px]">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold tracking-[.2em] text-fuchsia-300">
            EXPLORE YOUR PATH
          </p>
          <h2 className="mt-4 font-serif text-4xl tracking-tight sm:text-6xl">
            Our Popular Courses &amp; Programs
          </h2>
        </div>

        <div className="mt-8 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none]">
          {programCategories.map((item) => {
            const active = item === category;
            return (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`relative shrink-0 rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors ${active ? "border-fuchsia-300/40 text-white" : "border-white/10 bg-white/[.025] text-white/55 hover:border-white/25 hover:text-white"}`}
              >
                {active && (
                  <motion.span
                    layoutId="program-category"
                    className="absolute inset-0 rounded-full bg-fuchsia-500/15"
                    transition={{ type: "spring", bounce: 0.1, duration: 0.5 }}
                  />
                )}
                <span className="relative z-10">{item}</span>
              </button>
            );
          })}
        </div>

        <motion.div
          key={category}
          initial={reduceMotion ? false : { opacity: 0, x: 28, scale: 0.985 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.62, ease: [0.16, 1, 0.3, 1] }}
          className="program-showcase-frame relative mt-10 h-[390px] sm:h-[430px]"
          role="region"
          aria-label="Featured course showcase"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") move(-1);
            if (event.key === "ArrowRight") move(1);
          }}
          onPointerEnter={() => setPaused(true)}
          onPointerLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
          drag={reduceMotion ? false : "x"}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.12}
          onDragStart={() => setPaused(true)}
          onDragEnd={(_, info) => {
            setPaused(false);
            if (Math.abs(info.offset.x) > 42 || Math.abs(info.velocity.x) > 360)
              move(info.offset.x > 0 ? -1 : 1);
          }}
        >
          <div className="pointer-events-none absolute inset-x-20 top-12 h-64 rounded-full bg-[radial-gradient(ellipse,rgba(154,90,255,.18),transparent_66%)] blur-3xl" />
          {programs.map((program, index) => (
            <ShowcaseCard
              key={program.slug}
              active={index === activeIndex}
              offset={ringOffset(index, activeIndex, programs.length)}
              program={program}
              backgroundImage={
                COURSE_CARD_BACKGROUNDS[
                  index % COURSE_CARD_BACKGROUNDS.length
                ]
              }
              onSelect={() => setActiveIndex(index)}
              reduceMotion={Boolean(reduceMotion)}
            />
          ))}
        </motion.div>

        <div className="mt-3 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => move(-1)}
            className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-white/70 transition hover:border-white/35 hover:text-white"
            aria-label="Previous program"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <p className="text-xs font-semibold tracking-[.16em] text-white/45">
            {String(activeIndex + 1).padStart(2, "0")} /{" "}
            {String(programs.length).padStart(2, "0")}
          </p>
          <button
            type="button"
            onClick={() => move(1)}
            className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-white/70 transition hover:border-white/35 hover:text-white"
            aria-label="Next program"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-8 flex justify-center">
          <Link
            href="/programs"
            className="group inline-flex items-center gap-3 text-sm font-semibold text-white/75 transition hover:text-white"
          >
            View All Programs{" "}
            <span className="grid h-10 w-10 place-items-center rounded-full border border-white/20 transition-transform group-hover:translate-x-1">
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

function ShowcaseCard({
  active,
  offset,
  onSelect,
  program,
  backgroundImage,
  reduceMotion,
}: {
  active: boolean;
  offset: number;
  onSelect: () => void;
  program: (typeof marketingPrograms)[number];
  backgroundImage: (typeof COURSE_CARD_BACKGROUNDS)[number];
  reduceMotion: boolean;
}) {
  const visible = Math.abs(offset) <= 2;
  const side = Math.abs(offset) === 1;
  const physicalWidth = active
    ? "w-[min(82vw,680px)]"
    : side
      ? "w-[min(62vw,480px)]"
      : "w-[min(56vw,420px)]";

  return (
    <motion.div
      className="absolute left-1/2 top-0"
      animate={{
        x: offset * 320,
        opacity: visible ? (active ? 1 : side ? 0.67 : 0.22) : 0,
        zIndex: 10 - Math.abs(offset),
      }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { duration: CARD_TRANSITION_SECONDS, ease: [0.22, 0.9, 0.3, 1] }
      }
      style={{ pointerEvents: visible ? "auto" : "none" }}
    >
      <div className="-translate-x-1/2">
        <motion.article
          layout
          onClick={onSelect}
          className={`program-showcase-card group relative cursor-pointer overflow-hidden rounded-[26px] border bg-white ${physicalWidth} ${active ? "border-violet-200 shadow-[0_24px_70px_rgba(109,58,215,.22)]" : "border-white/40 shadow-[0_16px_45px_rgba(17,18,31,.18)]"}`}
          animate={{
            scale: active ? 1 : side ? 0.84 : 0.76,
            y: active ? 0 : side ? 20 : 34,
          }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : {
                  layout: {
                    duration: CARD_TRANSITION_SECONDS,
                    ease: [0.22, 0.9, 0.3, 1],
                  },
                  duration: CARD_TRANSITION_SECONDS,
                  ease: [0.22, 0.9, 0.3, 1],
                }
          }
        >
          <div className="relative h-[350px] sm:h-[390px]">
            <Image
              src={backgroundImage}
              alt=""
              fill
              sizes="(min-width: 640px) 680px, 82vw"
              className={`object-cover object-center transition duration-700 ${active ? "scale-[1.03] opacity-100" : "scale-100 opacity-85 grayscale-[.05]"}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/94 to-white/12" />
            <div className="absolute inset-x-0 bottom-0 h-[64%] bg-[radial-gradient(ellipse_at_bottom_left,rgba(202,191,255,.24),transparent_58%)]" />
            <div className="relative flex h-full flex-col justify-end p-6 sm:p-8">
              <p className="text-[11px] font-semibold tracking-[.18em] text-violet-700">
                {program.level.toUpperCase()}
              </p>
              <h3
                className={`mt-3 font-serif leading-[.94] tracking-tight text-zinc-950 transition-all ${active ? "max-w-md text-4xl sm:text-5xl" : "text-2xl sm:text-3xl"}`}
              >
                {program.title}
              </h3>
              {active ? (
                <>
                  <p className="mt-4 max-w-xl text-sm leading-6 text-zinc-700 sm:text-base">
                    {program.description}
                  </p>
                  <p className="mt-4 text-xs font-medium tracking-[.08em] text-zinc-500">
                    {program.modules} · {program.duration} · Certificate
                  </p>
                  <Link
                    href={`/programs/${program.slug}`}
                    onClick={(event) => event.stopPropagation()}
                    className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-violet-700 transition-colors hover:text-violet-950"
                  >
                    View Program <ArrowRight className="h-4 w-4" />
                  </Link>
                </>
              ) : (
                <p className="mt-3 line-clamp-2 max-w-sm text-sm leading-5 text-zinc-600">
                  {program.description}
                </p>
              )}
            </div>
          </div>
        </motion.article>
      </div>
    </motion.div>
  );
}

function ringOffset(index: number, activeIndex: number, length: number) {
  const raw = index - activeIndex;
  const wrapped = ((raw + length / 2) % length) - length / 2;
  return length % 2 === 0 && wrapped === -length / 2 ? length / 2 : wrapped;
}
