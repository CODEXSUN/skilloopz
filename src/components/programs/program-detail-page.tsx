"use client";

import Link from "@/vite/platform/link";
import Image from "@/vite/platform/image";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Clock3,
  Copy,
  Download,
  Gauge,
  Layers3,
  Play,
  Settings2,
  Share2,
  Sparkles,
  Star,
  UsersRound,
  X,
} from "lucide-react";
import type { MarketingProgram } from "@/types/program";

interface ProgramDetailPageProps {
  program: MarketingProgram;
  relatedPrograms: MarketingProgram[];
}

export function ProgramDetailPage({ program, relatedPrograms }: ProgramDetailPageProps) {
  const [openModule, setOpenModule] = useState(0);
  const [compactReading, setCompactReading] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [tweakOpen, setTweakOpen] = useState(false);
  const [certificateOpen, setCertificateOpen] = useState(false);

  async function shareProgram() {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: program.title, text: program.description, url });
      return;
    }
    await navigator.clipboard.writeText(url);
    setLinkCopied(true);
    window.setTimeout(() => setLinkCopied(false), 1800);
  }

  return (
    <main className={`min-h-screen overflow-x-clip bg-[#05060d] text-white ${compactReading ? "[&_.program-section]:py-8" : "[&_.program-section]:py-12"}`}>
      <section className="relative overflow-hidden border-b border-white/10 px-4 pb-20 pt-32 sm:px-8 lg:px-12 lg:pb-28 lg:pt-40">
        <Image src={program.coverImage} alt="" fill priority sizes="100vw" className="object-cover opacity-[.16]" />
        <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${program.accent} opacity-25`} />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,.12),transparent_25%),linear-gradient(to_bottom,rgba(5,6,13,.3),#05060d)]" />
        <div className="relative mx-auto grid max-w-[1360px] gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="max-w-4xl">
            <Link href="/#programs" className="inline-flex items-center gap-2 text-sm text-white/65 transition hover:text-white">
              <ArrowLeft className="h-4 w-4" /> Explore all programs
            </Link>
            <p className="mt-12 text-[13px] font-semibold tracking-[.2em] text-fuchsia-200">{program.eyebrow}</p>
            <h1 className="mt-5 font-serif text-[clamp(3rem,7vw,6.8rem)] leading-[.88] tracking-[-.055em]">{program.title}</h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/72">{program.description}</p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/70">
              <span className="flex items-center gap-2"><span className="flex text-amber-300">{Array.from({ length: 5 }).map((_, index) => <Star key={index} className="h-4 w-4 fill-current" />)}</span>{program.rating}</span>
              <span className="flex items-center gap-2"><UsersRound className="h-4 w-4 text-violet-300" />{program.students} learners</span>
              <span className="rounded-full border border-white/15 px-3 py-1.5">{program.category}</span>
            </div>
            <div className="mt-10 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/12 bg-white/10 sm:grid-cols-5">
              <Metric icon={Clock3} label="Duration" value={program.duration} />
              <Metric icon={Gauge} label="Level" value={program.level} />
              <Metric icon={Layers3} label="Curriculum" value={program.modules} />
              <Metric icon={Sparkles} label="Practice" value={program.projects} />
              <Metric icon={UsersRound} label="Mode" value={program.deliveryMode} />
            </div>
            <Link href={`/apply?program=${program.slug}`} className="mt-8 inline-flex items-center gap-3 rounded-xl bg-white px-6 py-4 text-sm font-semibold text-black transition hover:bg-white/85">Apply Now <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-[1360px] gap-12 px-4 sm:px-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-12">
        <div className="min-w-0">
          <section className="program-section border-b border-white/10">
            <SectionHeading eyebrow="OUTCOMES" title="What you will learn" />
            <div className="mt-8 grid gap-x-8 gap-y-4 sm:grid-cols-2">
              {program.learningOutcomes.map((outcome) => <CheckRow key={outcome}>{outcome}</CheckRow>)}
            </div>
          </section>

          <section className="program-section border-b border-white/10">
            <SectionHeading eyebrow="PROGRAM OVERVIEW" title="About this program" />
            <p className="mt-7 max-w-3xl text-lg leading-8 text-white/68">{program.about}</p>
            <button type="button" onClick={() => window.print()} className="mt-7 inline-flex items-center gap-2 rounded-xl border border-white/18 px-4 py-3 text-sm font-semibold transition hover:bg-white/8">
              <Download className="h-4 w-4" /> Save program brochure
            </button>
          </section>

          <section id="curriculum" className="program-section border-b border-white/10">
            <SectionHeading eyebrow="SYLLABUS" title="Program curriculum" />
            <div className="mt-8 divide-y divide-white/10 border-y border-white/10">
              {program.curriculum.map((module, index) => {
                const isOpen = openModule === index;
                return (
                  <article key={module.title}>
                    <button type="button" aria-expanded={isOpen} onClick={() => setOpenModule(isOpen ? -1 : index)} className="flex w-full items-center gap-5 py-5 text-left">
                      <span className="w-8 shrink-0 text-[13px] font-semibold text-fuchsia-300">0{index + 1}</span>
                      <span className="min-w-0 flex-1"><span className="block text-lg font-semibold">{module.title}</span><span className="mt-1 block text-sm leading-6 text-white/55">{module.summary}</span></span>
                      <ChevronDown className={`h-5 w-5 shrink-0 text-white/55 transition ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                    <div className={`grid transition-[grid-template-rows] duration-300 ${isOpen ? "grid-rows-[1fr] pb-6" : "grid-rows-[0fr]"}`}>
                      <div className="overflow-hidden pl-[52px]"><div className="grid gap-3 rounded-2xl bg-white/[.035] p-5 sm:grid-cols-2">{module.lessons.map((lesson) => <CheckRow key={lesson}>{lesson}</CheckRow>)}</div></div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="program-section grid gap-12 border-b border-white/10 md:grid-cols-2">
            <Checklist title="Requirements" items={program.requirements} />
            <Checklist title="Material includes" items={program.materials} />
          </section>

          <section className="program-section grid gap-12 border-b border-white/10 md:grid-cols-2">
            <Checklist title="Who is this course for?" items={program.idealFor} />
            <Checklist title="Career opportunities" items={program.careerOpportunities} />
          </section>

          <section className="program-section border-b border-white/10">
            <SectionHeading eyebrow="WORKBENCH" title="Tools you will use" />
            <div className="mt-7 flex flex-wrap gap-3">{program.tools.map((tool) => <span key={tool} className="rounded-full border border-white/12 bg-white/[.035] px-4 py-2.5 text-sm text-white/75">{tool}</span>)}</div>
          </section>

          <section className="program-section border-b border-white/10">
            <SectionHeading eyebrow="RECOGNITION" title="Earn Your Certificate" />
            <div className="mt-8 grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
              <button type="button" onClick={() => setCertificateOpen(true)} className="group relative overflow-hidden rounded-2xl border border-white/15 text-left shadow-[0_24px_70px_rgba(0,0,0,.3)]">
                <Image src="/images/certificates/course-certificate-sample.png" alt="Sample ABHI course certificate awarded to ARUNEZ" width={1672} height={940} className="h-auto w-full transition duration-500 group-hover:scale-[1.02]" />
                <span className="absolute inset-x-0 bottom-0 bg-black/70 px-5 py-3 text-sm font-semibold text-white opacity-0 transition group-hover:opacity-100">View Certificate</span>
              </button>
              <div><p className="text-lg leading-8 text-white/70">Successfully complete the program and receive your course certificate.</p><button type="button" onClick={() => setCertificateOpen(true)} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-fuchsia-200">View Certificate <ArrowRight className="h-4 w-4" /></button></div>
            </div>
          </section>

          <section className="program-section">
            <SectionHeading eyebrow="COMMON QUESTIONS" title="Before you begin" />
            <div className="mt-8 divide-y divide-white/10 border-y border-white/10">{program.faqs.map((faq) => <details key={faq.question} className="group py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-5 font-semibold"><span>{faq.question}</span><ChevronDown className="h-5 w-5 shrink-0 text-white/55 transition group-open:rotate-180" /></summary><p className="max-w-3xl pt-4 leading-7 text-white/62">{faq.answer}</p></details>)}</div>
          </section>
        </div>

        <aside className="relative z-20 lg:-mt-56">
          <div className="sticky top-28 overflow-hidden rounded-3xl border border-white/12 bg-[#0b0c15]/95 shadow-[0_35px_90px_rgba(0,0,0,.4)] backdrop-blur-xl">
            <div className={`relative flex aspect-[16/10] items-center justify-center overflow-hidden bg-gradient-to-br ${program.accent}`}>
              <Image src={program.coverImage} alt={program.coverAlt} fill sizes="360px" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-white/5" />
              <span className="relative grid h-16 w-16 place-items-center rounded-full border border-white/35 bg-black/15 backdrop-blur"><Play className="ml-1 h-6 w-6 fill-white" /></span>
            </div>
            <div className="p-6">
              <div className="flex items-end justify-between gap-4"><p className="text-3xl font-semibold tracking-tight">{program.price}</p><p className="pb-1 text-[13px] text-white/52">Flexible payment available</p></div>
              <Link href={`/apply?program=${program.slug}`} className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-semibold text-black transition hover:bg-white/85">Apply Now <ArrowRight className="h-4 w-4" /></Link>
              <div className="mt-7 flex items-center gap-3 border-t border-white/10 pt-6"><span className="grid h-11 w-11 place-items-center rounded-full bg-violet-500/18 text-sm font-semibold text-violet-200">{program.mentor.initials}</span><div><p className="font-semibold">{program.mentor.name}</p><p className="text-[13px] text-white/52">{program.mentor.role}</p></div></div>
              <p className="mt-7 text-[13px] font-semibold tracking-[.14em] text-white/45">INCLUDED</p>
              <div className="mt-4 grid gap-3">{program.benefits.map((benefit) => <CheckRow key={benefit}>{benefit}</CheckRow>)}</div>
              <button type="button" onClick={shareProgram} className="mt-7 flex w-full items-center justify-center gap-2 border-t border-white/10 pt-5 text-sm text-white/65 transition hover:text-white">{linkCopied ? <Copy className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}{linkCopied ? "Link copied" : "Share program"}</button>
            </div>
          </div>
        </aside>
      </div>

      <section className="border-t border-white/10 px-4 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-[1360px]"><SectionHeading eyebrow="KEEP EXPLORING" title="Related programs" /><div className="mt-8 grid gap-4 md:grid-cols-3">{relatedPrograms.map((related) => <Link key={related.slug} href={`/programs/${related.slug}`} className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[.025] transition hover:border-white/25 hover:bg-white/[.05]"><div className="relative aspect-[16/8] overflow-hidden"><Image src={related.coverImage} alt={related.coverAlt} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-[#090a12] to-transparent" /></div><div className="p-6"><p className="text-[13px] font-semibold text-fuchsia-300">{related.category}</p><h3 className="mt-4 text-2xl font-semibold">{related.title}</h3><p className="mt-3 leading-6 text-white/58">{related.description}</p><span className="mt-7 inline-flex items-center gap-2 text-sm font-semibold">View program <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span></div></Link>)}</div></div>
      </section>

      <section className="border-t border-white/10 px-4 py-20 text-center sm:px-8 lg:px-12 lg:py-28"><p className="text-xs font-semibold tracking-[.2em] text-fuchsia-300">YOUR NEXT STEP</p><h2 className="mt-4 font-serif text-4xl tracking-tight sm:text-6xl">Ready to Start Your Learning Journey?</h2><Link href={`/apply?program=${program.slug}`} className="mt-8 inline-flex items-center gap-3 rounded-xl bg-white px-6 py-4 text-sm font-semibold text-black transition hover:bg-white/85">Apply Now <ArrowRight className="h-4 w-4" /></Link></section>

      {certificateOpen && <div role="dialog" aria-modal="true" aria-label="Course certificate preview" className="fixed inset-0 z-[90] grid place-items-center bg-black/85 p-4 backdrop-blur-sm"><button type="button" aria-label="Close certificate preview" onClick={() => setCertificateOpen(false)} className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-black/40 text-white"><X className="h-5 w-5" /></button><div className="max-h-[90vh] max-w-6xl overflow-auto rounded-xl"><Image src="/images/certificates/course-certificate-sample.png" alt="Sample ABHI course certificate awarded to ARUNEZ" width={1672} height={940} className="h-auto w-full" priority /></div></div>}

      <aside className={`fixed bottom-4 right-20 z-[70] rounded-2xl border border-white/15 bg-[#0b0b16]/95 shadow-2xl backdrop-blur-xl transition-all print:hidden ${tweakOpen ? "w-[min(18rem,calc(100vw-6rem))] p-3" : "w-12 p-1"}`} aria-label="Program page appearance controls">
        {tweakOpen ? <><div className="flex items-center justify-between gap-3 px-1"><span className="flex items-center gap-2 text-sm font-semibold"><Settings2 className="h-4 w-4 text-fuchsia-300" />Reading spacing</span><button type="button" onClick={() => setTweakOpen(false)} aria-label="Close appearance controls" className="grid h-7 w-7 place-items-center rounded-lg text-white/55 transition hover:bg-white/10 hover:text-white"><X className="h-4 w-4" /></button></div><div className="mt-3 grid grid-cols-2 rounded-xl bg-white/[.06] p-1 text-sm">{[{ label: "Relaxed", compact: false }, { label: "Compact", compact: true }].map((option) => <button key={option.label} type="button" aria-pressed={compactReading === option.compact} onClick={() => setCompactReading(option.compact)} className={`rounded-lg px-3 py-2 font-medium transition ${compactReading === option.compact ? "bg-white text-black" : "text-white/60 hover:text-white"}`}>{option.label}</button>)}</div></> : <button type="button" onClick={() => setTweakOpen(true)} aria-label="Open appearance controls" className="grid h-10 w-10 place-items-center rounded-xl text-fuchsia-200 transition hover:bg-white/10"><Settings2 className="h-4 w-4" /></button>}
      </aside>
    </main>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Clock3; label: string; value: string }) {
  return <div className="bg-black/18 p-4"><Icon className="h-5 w-5 text-violet-200" /><p className="mt-4 text-[13px] text-white/48">{label}</p><p className="mt-1 text-sm font-semibold leading-5">{value}</p></div>;
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return <div><p className="text-[13px] font-semibold tracking-[.18em] text-fuchsia-300">{eyebrow}</p><h2 className="mt-3 font-serif text-3xl tracking-tight sm:text-4xl">{title}</h2></div>;
}

function CheckRow({ children }: { children: React.ReactNode }) {
  return <div className="flex items-start gap-3 text-sm leading-6 text-white/72"><Check className="mt-1 h-4 w-4 shrink-0 text-violet-300" />{children}</div>;
}

function Checklist({ title, items }: { title: string; items: string[] }) {
  return <div><h2 className="font-serif text-3xl tracking-tight">{title}</h2><div className="mt-6 grid gap-4">{items.map((item) => <CheckRow key={item}>{item}</CheckRow>)}</div></div>;
}
