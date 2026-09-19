"use client";

import { useRef } from "react";
import { ArrowLeft, Award, Download } from "lucide-react";
import Link from "next/link";

interface CertificateDisplayProps {
  serial: string;
  issuedAt: Date;
  courseTitle: string;
  userName: string;
}

export function CertificateDisplay({ serial, issuedAt, courseTitle, userName }: CertificateDisplayProps) {
  const ref = useRef<HTMLDivElement>(null);

  const issuedDate = new Date(issuedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#070809] p-4 sm:p-8">
      <div className="mb-6 flex w-full max-w-3xl items-center justify-between">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-4 py-2 text-sm text-foreground transition-all hover:bg-[rgba(255,255,255,0.1)]"
        >
          <Download className="h-4 w-4" />
          Download PDF
        </button>
      </div>

      <div
        ref={ref}
        className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-[rgba(255,255,255,0.1)] bg-gradient-to-br from-[#0B0D10] via-[#0F1117] to-[#0B0D10] p-8 shadow-2xl sm:p-16 print:border-none print:shadow-none"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(79,124,255,0.08),transparent_70%)]" />
        <div className="pointer-events-none absolute -right-32 -top-32 h-64 w-64 rounded-full bg-primary-500/10 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-accent-500/10 blur-[100px]" />

        <div className="relative z-10">
          <div className="mb-8 flex items-center justify-center gap-3">
            <Award className="h-8 w-8 text-primary-400" />
            <span className="font-heading text-xl font-bold tracking-wider text-foreground">
              NEOT
            </span>
          </div>

          <div className="mb-2 text-center text-xs font-medium uppercase tracking-[0.2em] text-primary-400/60">
            Certificate of Completion
          </div>

          <h1 className="mb-2 text-center font-heading text-3xl font-bold text-foreground sm:text-4xl">
            {courseTitle}
          </h1>

          <div className="mb-8 h-px bg-gradient-to-r from-transparent via-primary-500/30 to-transparent" />

          <p className="mb-6 text-center text-sm text-muted-foreground">
            This certifies that
          </p>

          <p className="mb-6 text-center font-heading text-2xl font-bold text-foreground sm:text-3xl">
            {userName}
          </p>

          <p className="mb-8 text-center text-sm text-muted-foreground">
            has successfully completed the course
          </p>

          <div className="mb-12 flex items-center justify-center gap-8 text-xs text-muted-foreground">
            <div className="text-center">
              <p className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground/50">Date Issued</p>
              <p className="text-foreground">{issuedDate}</p>
            </div>
            <div className="h-8 w-px bg-[rgba(255,255,255,0.08)]" />
            <div className="text-center">
              <p className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground/50">Certificate ID</p>
              <p className="font-mono text-[11px] text-foreground">{serial}</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground/40">
            <Award className="h-3 w-3" />
            <span>Verified by NEOT Learning Platform</span>
          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              @page { margin: 0.5in; }
            }
          `,
        }}
      />
    </div>
  );
}
