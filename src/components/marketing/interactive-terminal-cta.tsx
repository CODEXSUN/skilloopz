"use client";

import Link from "@/vite/platform/link";
import {
  ArrowUpRight,
  CornerDownLeft,
  RotateCcw,
  Terminal,
} from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const prompts = [
  {
    question: "What are you ready to build toward?",
    options: [
      "Ship products",
      "Build with AI",
      "Design experiences",
      "Find my path",
    ],
  },
  {
    question: "How much focused time can you give each week?",
    options: ["4–6 hours", "8–10 hours", "I’ll make the time"],
  },
];

export function InteractiveTerminalCta() {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() =>
      setTarget(document.getElementById("start")),
    );
    return () => window.cancelAnimationFrame(frame);
  }, []);
  if (!target) return null;

  const prompt = prompts[answers.length];
  const choose = (answer: string) =>
    setAnswers((current) => [...current, answer]);

  return createPortal(
    <article className="terminal-cta relative mx-auto max-w-[1360px] overflow-hidden rounded-[30px] border border-violet-300/25 bg-[#090916] shadow-[0_30px_110px_rgba(85,38,181,.28)]">
      <div className="terminal-glow pointer-events-none absolute inset-0" />
      <header className="relative flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-7">
        <div className="flex items-center gap-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-fuchsia-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-violet-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-indigo-300" />
          <span className="ml-2 font-mono text-[10px] font-semibold tracking-[.2em] text-white/45 sm:text-xs">
            SKILLOOPZ / PATHWAY TERMINAL
          </span>
        </div>
        <span className="flex items-center gap-2 font-mono text-[10px] text-emerald-300/80">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" />
          ONLINE
        </span>
      </header>
      <div className="relative min-h-[350px] px-5 py-9 sm:min-h-[390px] sm:px-12 sm:py-12">
        <div className="mx-auto max-w-3xl font-mono">
          <div className="flex items-center gap-3 text-xs text-violet-200/65">
            <Terminal className="h-4 w-4 text-fuchsia-300" />
            <span>career-engine v1.0</span>
            <span className="text-white/25">·</span>
            <span>let&apos;s make this personal</span>
          </div>
          <p className="mt-8 text-sm leading-6 text-white/60">
            &gt; We&apos;ll help you find a practical next move. Two quick
            prompts, zero pressure.
          </p>
          {answers.map((answer, index) => (
            <div key={answer} className="terminal-line mt-6">
              <p className="text-sm text-violet-200/75">
                &gt; {prompts[index].question}
              </p>
              <p className="mt-2 flex items-center gap-2 text-sm text-white">
                <CornerDownLeft className="h-4 w-4 text-fuchsia-300" />
                {answer}
              </p>
            </div>
          ))}
          {prompt ? (
            <div className="terminal-line mt-8">
              <p className="text-xl font-medium leading-snug text-white sm:text-2xl">
                <span className="mr-3 text-fuchsia-300">&gt;</span>
                {prompt.question}
                <span className="terminal-caret ml-1" />
              </p>
              <div className="mt-6 flex flex-wrap gap-2.5">
                {prompt.options.map((option, index) => (
                  <button
                    type="button"
                    onClick={() => choose(option)}
                    key={option}
                    className="terminal-choice"
                  >
                    <span className="text-fuchsia-300/80">0{index + 1}</span>
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="terminal-line mt-9">
              <p className="text-sm leading-6 text-emerald-200/80">
                &gt; Profile complete. We&apos;ve prepared a path built for
                momentum, proof of work, and your next opportunity.
              </p>
              <p className="mt-4 text-2xl font-medium text-white sm:text-3xl">
                Your next chapter is ready.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/programs" className="terminal-primary">
                  Explore your programs <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link href="/pricing" className="terminal-secondary">
                  Compare plans
                </Link>
                <button
                  type="button"
                  onClick={() => setAnswers([])}
                  className="terminal-reset"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Start over
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </article>,
    target,
  );
}
