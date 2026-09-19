"use client";

import { ArrowUpRight, BookOpen, MapPin } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export function CollaborationsAndPartners() {
  return (
    <section
      id="collaborations"
      className="px-4 py-16 sm:px-8 lg:px-12 lg:py-24"
    >
      <div className="collaboration-panel relative mx-auto overflow-hidden rounded-[26px] border border-white/[.1] bg-[#080914] px-6 py-9 sm:px-10 sm:py-12 lg:px-12 lg:py-14">
        <p className="text-xs font-semibold tracking-[.22em] text-fuchsia-300">
          OUR COLLABORATIONS &amp; PARTNERS
        </p>
        <div className="mt-6 grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
          <div>
            <h2 className="max-w-xl font-serif text-4xl leading-[.94] tracking-[-.03em] sm:text-5xl">
              Built closer to the world learners are entering.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/60 sm:text-lg">
              The strongest learning experiences connect skills, people, and
              real opportunity with intention.
            </p>
          </div>
          <div className="grid gap-0 border-y border-white/[.09] lg:border-b-0">
            {["Industry insight", "Learning community", "Career guidance"].map(
              (item, index) => (
                <div
                  key={item}
                  className={`group grid grid-cols-[42px_1fr_auto] items-center gap-4 py-5 ${index > 0 ? "border-t border-white/[.09]" : ""}`}
                >
                  <span className="text-xs font-semibold tracking-[.18em] text-white/35">
                    0{index + 1}
                  </span>
                  <span className="text-lg font-medium text-white/90">
                    {item}
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-white/30 transition duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-fuchsia-200" />
                </div>
              ),
            )}
          </div>
        </div>
        <div className="mt-10 hidden grid-cols-3 gap-3">
          {["Industry insight", "Learning community", "Career guidance"].map(
            (item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/10 bg-white/[.025] px-5 py-5 text-lg font-medium text-white/85"
              >
                {item}
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}

const successMetrics = [
  { total: 300000, suffix: "+", label: "Sessions" },
  { total: 24, suffix: "+", label: "Experts" },
  { total: 100000, suffix: "+", label: "Students" },
  { total: 100, suffix: "%", label: "Student Satisfaction" },
];

const studentReviews = [
  [
    "I left with a portfolio and the confidence to interview.",
    "Ishita Sharma",
    "Product Designer",
  ],
  [
    "The project reviews taught me how to think like an engineer.",
    "Arjun Nair",
    "Full Stack Developer",
  ],
  [
    "Every module became something real I could show recruiters.",
    "Maya Joseph",
    "Data Analyst",
  ],
];

export function DreamStudySuccess() {
  const panelRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    let frame = 0;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      frame = requestAnimationFrame(() => setProgress(1));
      return () => cancelAnimationFrame(frame);
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        const start = performance.now();
        const animate = (now: number) => {
          const elapsed = Math.min((now - start) / 3400, 1);
          setProgress(1 - (1 - elapsed) ** 4);
          if (elapsed < 1) frame = requestAnimationFrame(animate);
        };
        frame = requestAnimationFrame(animate);
        observer.disconnect();
      },
      { threshold: 0.35 },
    );
    observer.observe(panel);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section id="study-spot" className="px-4 py-16 sm:px-8 lg:px-12 lg:py-24">
      <div
        id="success-story"
        ref={panelRef}
        className="success-spot-panel relative mx-auto max-w-[1360px] overflow-hidden rounded-[26px] border border-white/[.11] bg-[#070811] p-6 sm:p-10 lg:p-12"
      >
        <span className="success-particle success-particle-one" />
        <span className="success-particle success-particle-two" />
        <span className="success-particle success-particle-three" />
        <div className="relative z-10 grid gap-9 lg:grid-cols-[.9fr_1.1fr]">
          <div className="flex flex-col justify-center">
            <p className="text-white/48 text-xs font-semibold tracking-[.22em]">
              STUDENTS SUCCESS STORIES
            </p>
            <p className="text-xs font-semibold tracking-[.22em] text-fuchsia-200/90">
              DISCOVER YOUR DREAM STUDY SPOT
            </p>
            <p className="mt-3 text-xs font-semibold tracking-[.22em] text-cyan-100/65">
              OUR SUCCESS STORY
            </p>
            <h2 className="mt-7 max-w-xl font-serif text-4xl leading-[.92] tracking-[-.035em] text-white sm:text-5xl lg:text-6xl">
              Focus meets forward <span className="text-white/72">motion.</span>
            </h2>
            <p className="text-white/62 mt-6 max-w-md text-base leading-7 sm:text-lg">
              We listen and work together to create a truly unique and
              unforgettable experience.
            </p>
            <Link
              href="/apply"
              className="group mt-9 inline-flex items-center gap-2 text-sm font-semibold text-white/90 transition hover:text-white"
            >
              Start your learning journey{" "}
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
          <div className="success-metrics-shell relative z-10 min-h-[315px] overflow-hidden rounded-[20px] border border-white/[.1] bg-white/[.025] p-4 backdrop-blur-xl sm:p-5">
            <svg
              className="success-trajectory pointer-events-none absolute inset-0 h-full w-full"
              viewBox="0 0 620 360"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="success-line" x1="0" x2="1">
                  <stop stopColor="#8ba6c9" stopOpacity="0" />
                  <stop offset=".4" stopColor="#ad93d9" stopOpacity=".35" />
                  <stop offset=".75" stopColor="#b5c6d7" stopOpacity=".68" />
                  <stop offset="1" stopColor="#d7e7ee" stopOpacity=".1" />
                </linearGradient>
              </defs>
              <path
                className="success-trajectory-line"
                d="M-20 300 C92 292 122 260 182 244 S278 206 333 217 S411 176 452 142 S536 87 645 60"
              />
              <circle
                className="success-trajectory-dot dot-one"
                cx="182"
                cy="244"
                r="3"
              />
              <circle
                className="success-trajectory-dot dot-two"
                cx="333"
                cy="217"
                r="3"
              />
              <circle
                className="success-trajectory-dot dot-three"
                cx="452"
                cy="142"
                r="3.5"
              />
              <circle
                className="success-trajectory-dot dot-four"
                cx="574"
                cy="86"
                r="4"
              />
            </svg>
            <div className="relative z-10 flex items-center justify-between border-b border-white/[.09] pb-4">
              <span className="text-white/88 flex items-center gap-2 text-sm font-medium">
                <MapPin className="h-4 w-4 text-fuchsia-200/85" /> Your study
                space
              </span>
              <BookOpen className="h-4 w-4 text-white/45" />
            </div>
            <div className="relative z-10 mt-4 grid grid-cols-2 gap-3">
              {successMetrics.map((metric) => (
                <article
                  key={metric.label}
                  className="rounded-xl border border-white/10 bg-black/20 p-3 backdrop-blur-sm"
                >
                  <p className="success-metric-value text-2xl font-semibold tracking-[-.045em] text-white sm:text-3xl">
                    {formatMetric(metric.total, metric.suffix, progress)}
                  </p>
                  <p className="text-white/58 mt-1 text-sm leading-5">
                    {metric.label}
                  </p>
                  <span className="success-data-indicator mt-3 block" />
                </article>
              ))}
            </div>
          </div>
        </div>
        <div
          className="success-review-marquee relative z-10 mt-2 border-t border-white/[.09] pt-6"
          aria-label="Student success reviews"
        >
          <div className="success-review-track">
            {[...studentReviews, ...studentReviews].map(
              ([quote, name, role], index) => (
                <article
                  key={`${name}-${index}`}
                  className="success-review-card"
                >
                  <p>“{quote}”</p>
                  <span>
                    {name} · {role}
                  </span>
                </article>
              ),
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function formatMetric(total: number, suffix: string, progress: number) {
  return `${new Intl.NumberFormat("en-US").format(Math.round(total * progress))}${suffix}`;
}
