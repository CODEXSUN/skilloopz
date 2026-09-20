"use client";

import Link from "@/vite/platform/link";
import Image from "@/vite/platform/image";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bot,
  ChevronDown,
  Code2,
  Compass,
  MoveRight,
  Sparkles,
  Star,
  UsersRound,
} from "lucide-react";
import { ScrollVideoHero } from "@/components/marketing/scroll-video-hero";
import { PortalStats } from "@/components/marketing/portal-stats";
import { InteractiveTerminalCta } from "@/components/marketing/interactive-terminal-cta";
import { TrustedCompanies } from "@/components/marketing/trusted-companies";
import { PopularPrograms } from "@/components/marketing/popular-programs";
import { MentorShowcase } from "@/components/marketing/mentor-showcase";
import { SkilloopzLogo } from "@/components/branding/skilloop-logo";
import {
  CollaborationsAndPartners,
  DreamStudySuccess,
} from "@/components/marketing/home-continuation-sections";

const benefits = [
  {
    title: "Learn by building",
    body: "Turn every new concept into portfolio-ready work, not passive notes.",
    icon: Code2,
    span: "md:col-span-2",
  },
  {
    title: "Industry mentors",
    body: "Weekly feedback from people who work in the roles you want.",
    icon: UsersRound,
    span: "",
  },
  {
    title: "AI study companion",
    body: "Get unstuck, review concepts, and keep momentum at any hour.",
    icon: Bot,
    span: "",
  },
  {
    title: "Career launch system",
    body: "Interview practice, project reviews, hiring partner access, and clear next steps.",
    icon: Compass,
    span: "md:col-span-2",
  },
];

const pathway = [
  [
    "01",
    "Choose your path",
    "Find a program aligned with the work you want to do.",
  ],
  [
    "02",
    "Build in public",
    "Learn live, ship guided projects, and get useful feedback.",
  ],
  [
    "03",
    "Prove your skills",
    "Graduate with a portfolio that shows how you think.",
  ],
  [
    "04",
    "Launch your career",
    "Prepare for interviews and meet hiring partners.",
  ],
];

const testimonials = [
  {
    quote:
      "I came in with curiosity and left with a portfolio, a clear plan, and the confidence to interview.",
    name: "Ishita Sharma",
    outcome: "Placed as Product Designer",
    initials: "IS",
  },
  {
    quote:
      "The project reviews were the difference. I learned to explain decisions like a real engineer.",
    name: "Arjun Nair",
    outcome: "Placed as Full Stack Developer",
    initials: "AN",
  },
  {
    quote:
      "The program made AI feel practical. Every module led to something I could actually show recruiters.",
    name: "Maya Joseph",
    outcome: "Data Analyst at a fintech startup",
    initials: "MJ",
  },
];

const faqs = [
  [
    "Who are these programs for?",
    "They are designed for beginners, career switchers, and working professionals who want structured, project-led learning.",
  ],
  [
    "How much time should I plan each week?",
    "Most learners spend 8 to 10 hours a week across live sessions, guided practice, and project work.",
  ],
  [
    "Do I get help with placements?",
    "Pro and Elite plans include career preparation, portfolio review, and access to relevant hiring opportunities.",
  ],
  [
    "Can I learn while working full-time?",
    "Yes. Sessions, guided work, and the AI companion are designed to support flexible learning schedules.",
  ],
];

function SectionIntro({
  eyebrow,
  title,
  copy,
}: {
  eyebrow: string;
  title: string;
  copy: string;
}) {
  const introRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: introRef,
    offset: ["start 90%", "start 42%"],
  });
  const y = useSpring(useTransform(scrollYProgress, [0, 1], [30, 0]), {
    damping: 28,
    stiffness: 130,
  });
  const scale = useSpring(useTransform(scrollYProgress, [0, 1], [0.985, 1]), {
    damping: 28,
    stiffness: 130,
  });
  const opacity = useTransform(scrollYProgress, [0, 0.72, 1], [0, 0.88, 1]);

  return (
    <motion.div
      ref={introRef}
      style={{ y, scale, opacity }}
      className="max-w-2xl will-change-transform"
    >
      <p className="text-xs font-semibold tracking-[.2em] text-fuchsia-300">
        {eyebrow}
      </p>
      <h2 className="mt-4 font-serif text-4xl leading-[.95] tracking-tight sm:text-5xl">
        {title}
      </h2>
      <p className="mt-5 text-base leading-7 text-white/60 sm:text-lg">
        {copy}
      </p>
    </motion.div>
  );
}

export function LandingPage() {
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [newsletterError, setNewsletterError] = useState("");
  const [newsletterPending, setNewsletterPending] = useState(false);

  const testimonial = testimonials[testimonialIndex];

  const changeTestimonial = (direction: number) =>
    setTestimonialIndex(
      (current) =>
        (current + direction + testimonials.length) % testimonials.length,
    );

  async function subscribe(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNewsletterPending(true);
    setNewsletterError("");
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newsletterEmail }),
      });
      if (!response.ok) throw new Error("Subscription failed");
      setIsSubscribed(true);
    } catch {
      setNewsletterError("Could not join right now. Please try again.");
    } finally {
      setNewsletterPending(false);
    }
  }

  useEffect(() => {
    const revealTargets = [["#programs > div", "program-reveal"]] as const;

    const observers = revealTargets.flatMap(([selector, revealClass]) => {
      const element = document.querySelector<HTMLElement>(selector);
      if (!element) return [];

      element.classList.add(revealClass);
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            element.classList.add("is-visible");
            observer.disconnect();
          }
        },
        { threshold: 0.42 },
      );

      observer.observe(element);
      return [observer];
    });

    return () => observers.forEach((observer) => observer.disconnect());
  }, []);

  useEffect(() => {
    const liquidSelectors = [
      "main > section:nth-of-type(5) > div:last-child > div",
      "#why-abhi article",
      "#pathway > div:last-child > div:last-child > article",
      "#mentors article",
      "#stories > div > div > div:last-child",
      "#study-spot > div",
      "#success-story article",
      "#faq > div > div:last-child > article",
      "#start > div > div:last-child",
      "footer > div:first-child > div",
      "footer > div:last-child",
    ];

    const observers = liquidSelectors.flatMap((selector) =>
      Array.from(document.querySelectorAll<HTMLElement>(selector)).map(
        (element, index) => {
          element.classList.add("liquid-reveal");
          element.style.setProperty(
            "--liquid-delay",
            `${80 + (index % 4) * 75}ms`,
          );

          const observer = new IntersectionObserver(
            ([entry]) => {
              element.classList.toggle("is-visible", entry.isIntersecting);
            },
            { threshold: 0.14, rootMargin: "0px 0px -10% 0px" },
          );

          observer.observe(element);
          return observer;
        },
      ),
    );

    return () => observers.forEach((observer) => observer.disconnect());
  }, []);

  return (
    <main className="min-h-screen overflow-x-clip bg-[#05060d] text-white selection:bg-fuchsia-500/50">
      <ScrollVideoHero>
        <PortalStats />
      </ScrollVideoHero>

      <TrustedCompanies />

      <section className="relative overflow-hidden px-4 py-20 sm:px-8 lg:px-12 lg:py-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(136,72,255,.28),transparent_25%),radial-gradient(circle_at_24%_100%,rgba(36,108,255,.14),transparent_30%)]" />
        <div className="relative mx-auto grid max-w-[1360px] items-end gap-8 lg:grid-cols-[1.1fr_.9fr]">
          <div>
            <p className="text-xs font-semibold tracking-[.22em] text-fuchsia-300">
              JOB READY FORMULA
            </p>
            <h2 className="mt-6 max-w-4xl font-serif text-[clamp(3.4rem,7vw,7.6rem)] leading-[.84] tracking-[-.06em]">
              You&apos;re not taking a course.
              <br />
              <span className="bg-gradient-to-r from-fuchsia-300 via-violet-300 to-cyan-200 bg-clip-text text-transparent">
                You&apos;re rehearsing your next role.
              </span>
            </h2>
          </div>
          <div className="rounded-3xl border border-white/15 bg-white/[.045] p-7 backdrop-blur-xl">
            <p className="text-4xl font-semibold tracking-tight">01</p>
            <p className="mt-10 max-w-sm text-lg leading-7 text-white/70">
              Every week ends with evidence of progress: work you have made,
              decisions you can defend, and feedback that makes the next version
              stronger.
            </p>
            <Link
              href="#pathway"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-white"
            >
              See the learning path <MoveRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <PopularPrograms />

      <section
        id="why-abhi"
        className="marketing-stage px-4 py-16 sm:px-8 lg:px-12 lg:py-28"
      >
        <div className="mx-auto max-w-[1360px]">
          <SectionIntro
            eyebrow="WHY CHOOSE US?"
            title="Your career needs more than a course."
            copy="A considered system that turns learning time into work you can show, discuss, and build on."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <motion.article
                  whileHover={{ y: -7, scale: 1.005 }}
                  key={benefit.title}
                  className={`luminous-panel rounded-3xl border border-white/10 p-7 ${benefit.span}`}
                >
                  <Icon
                    className="relative z-10 h-7 w-7 text-violet-300"
                    strokeWidth={1.5}
                  />
                  <h3 className="relative z-10 mt-12 text-2xl font-medium">
                    {benefit.title}
                  </h3>
                  <p className="relative z-10 mt-3 max-w-md leading-6 text-white/60">
                    {benefit.body}
                  </p>
                  <span className="absolute bottom-7 right-7 text-xs font-semibold tracking-[.18em] text-white/30">
                    SKILLOOPZ / {benefit.title.slice(0, 2).toUpperCase()}
                  </span>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      <section
        id="pathway"
        className="relative overflow-hidden border-y border-white/[.06] bg-[#080912] px-4 py-16 sm:px-8 lg:px-12 lg:py-28"
      >
        <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(ellipse_at_right,rgba(95,58,255,.2),transparent_65%)]" />
        <div className="relative mx-auto grid max-w-[1360px] gap-12 lg:grid-cols-[.76fr_1.24fr]">
          <SectionIntro
            eyebrow="THE LEARNING PATH"
            title="From first step to first offer."
            copy="No vague finish line. See exactly what happens at every stage of your learning journey."
          />
          <div className="relative grid gap-3 sm:grid-cols-2">
            <div className="pointer-events-none absolute bottom-10 left-[25%] top-10 hidden w-px bg-gradient-to-b from-fuchsia-300/60 via-violet-300/20 to-transparent sm:block" />
            {pathway.map(([number, title, copy], index) => (
              <article
                key={number}
                className={`relative rounded-2xl border border-white/10 p-6 ${index === 0 || index === 3 ? "luminous-panel" : "bg-white/[.025]"}`}
              >
                <span className="relative z-10 text-sm font-semibold text-fuchsia-300">
                  {number}
                </span>
                <h3 className="relative z-10 mt-9 text-xl font-medium">
                  {title}
                </h3>
                <p className="relative z-10 mt-3 text-sm leading-6 text-white/60">
                  {copy}
                </p>
                <MoveRight className="relative z-10 mt-8 h-5 w-5 text-white/45" />
              </article>
            ))}
          </div>
        </div>
      </section>

      <MentorShowcase />

      <CollaborationsAndPartners />

      <section id="stories" className="px-4 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="relative mx-auto max-w-[1360px] overflow-hidden rounded-[30px] border border-white/10 bg-gradient-to-br from-violet-950/70 via-[#0c0b17] to-[#090a10] p-6 sm:p-10">
          <Image
            src="/images/fallbacks/learning-card.webp"
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-[.12]"
          />
          <div className="via-[#0c0b17]/88 to-[#090a10]/78 absolute inset-0 bg-gradient-to-r from-[#10091e]/95" />
          <div className="relative grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
            <SectionIntro
              eyebrow="STUDENTS SUCCESS STORIES"
              title="The work changes how you show up."
              copy="A better outcome starts with a more deliberate learning experience."
            />
            <div className="flex flex-col justify-between">
              <div>
                <div className="flex gap-1 text-amber-300">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <blockquote className="mt-6 font-serif text-3xl leading-tight tracking-tight sm:text-4xl">
                  “{testimonial.quote}”
                </blockquote>
                <div className="mt-8 flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-sm font-semibold">
                    {testimonial.initials}
                  </span>
                  <div>
                    <p className="font-medium">{testimonial.name}</p>
                    <p className="text-sm text-white/55">
                      {testimonial.outcome}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-10 flex gap-3">
                <button
                  type="button"
                  aria-label="Previous story"
                  onClick={() => changeTestimonial(-1)}
                  className="grid h-11 w-11 place-items-center rounded-full border border-white/15 transition hover:bg-white/10"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Next story"
                  onClick={() => changeTestimonial(1)}
                  className="grid h-11 w-11 place-items-center rounded-full border border-white/15 transition hover:bg-white/10"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <DreamStudySuccess />

      <section
        id="faq"
        className="border-y border-white/[.06] bg-white/[.015] px-4 py-16 sm:px-8 lg:px-12 lg:py-24"
      >
        <div className="mx-auto grid max-w-[1100px] gap-10 lg:grid-cols-[.8fr_1.2fr]">
          <SectionIntro
            eyebrow="FAQ"
            title="Questions, answered."
            copy="Everything you need to know before you begin."
          />
          <div className="divide-y divide-white/10 border-y border-white/10">
            {faqs.map(([question, answer], index) => {
              const isOpen = openFaq === index;
              return (
                <article key={question}>
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-6 py-5 text-left font-medium"
                  >
                    <span>{question}</span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-white/60 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  <div
                    className={`grid transition-[grid-template-rows] duration-300 ${isOpen ? "grid-rows-[1fr] pb-5" : "grid-rows-[0fr]"}`}
                  >
                    <p className="overflow-hidden leading-7 text-white/60">
                      {answer}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="start" className="px-4 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="relative mx-auto max-w-[1360px] overflow-hidden rounded-[30px] border border-fuchsia-300/20 bg-gradient-to-br from-fuchsia-700 via-violet-800 to-indigo-950 px-6 py-14 text-center shadow-[0_30px_100px_rgba(105,53,255,.35)] sm:px-12 sm:py-20">
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/20 blur-[100px]" />
          <div className="relative mx-auto max-w-3xl">
            <Sparkles className="mx-auto h-7 w-7 text-fuchsia-100" />
            <h2 className="mt-6 font-serif text-4xl leading-[.95] tracking-tight sm:text-6xl">
              Ready to start your learning journey?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-7 text-white/75">
              Choose a path, build the work, and make your next opportunity feel
              possible.
            </p>
            <div className="mt-9 flex justify-center">
              <Link
                href="/apply"
                className="inline-flex items-center justify-center gap-3 rounded-xl bg-white px-6 py-4 font-semibold text-black transition hover:bg-white/85"
              >
                Apply Now <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer
        id="about"
        className="border-t border-white/[.08] px-4 pb-8 pt-14 sm:px-8 lg:px-12"
      >
        <div className="mx-auto grid max-w-[1360px] gap-10 md:grid-cols-[1.2fr_.8fr_.8fr_1.25fr]">
          <div>
            <SkilloopzLogo />
            <p className="mt-4 max-w-xs text-sm leading-6 text-white/55">
              The practical learning platform for people building their next
              chapter.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold">Explore</p>
            <div className="mt-4 grid gap-3 text-sm text-white/55">
              <Link href="#programs">Programs</Link>
              <Link href="#pathway">Learning path</Link>
              <Link href="#mentors">Mentors</Link>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold">Company</p>
            <div className="mt-4 grid gap-3 text-sm text-white/55">
              <Link href="/about">About</Link>
              <Link href="#stories">Stories</Link>
              <Link href="#success-story">Success story</Link>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold">Stay in the loop</p>
            <p className="mt-3 text-sm leading-6 text-white/55">
              New programs, resources, and career insights—occasionally.
            </p>
            <form
              onSubmit={subscribe}
              className="mt-4 flex rounded-xl border border-white/15 bg-white/[.04] p-1"
            >
              <input
                value={newsletterEmail}
                onChange={(event) => { setNewsletterEmail(event.target.value); setIsSubscribed(false); setNewsletterError(""); }}
                required
                type="email"
                placeholder="Email address"
                aria-label="Email address for updates"
                className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-white/35"
              />
              <button
                type="submit"
                disabled={newsletterPending || isSubscribed}
                className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-black"
              >
                {newsletterPending ? "Joining..." : isSubscribed ? "Joined" : "Join"}
              </button>
            </form>
            {newsletterError && <p role="alert" className="mt-2 text-sm text-rose-200">{newsletterError}</p>}
            {isSubscribed && <p role="status" className="mt-2 text-sm text-emerald-200">You are on the list.</p>}
          </div>
        </div>
        <div className="mx-auto mt-12 flex max-w-[1360px] flex-wrap justify-between gap-4 border-t border-white/[.08] pt-6 text-xs text-white/40">
          <span>
            © 2026 skilloopz. Built for the next generation of builders.
          </span>
          <span className="flex gap-4">
            <a href="https://www.linkedin.com" target="_blank" rel="noreferrer">
              LinkedIn
            </a>
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noreferrer"
            >
              Instagram
            </a>
          </span>
        </div>
      </footer>
      <InteractiveTerminalCta />
    </main>
  );
}
