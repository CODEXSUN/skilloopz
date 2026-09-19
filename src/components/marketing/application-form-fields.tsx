"use client";

import { Check, ChevronDown } from "lucide-react";
import { marketingPrograms } from "@/lib/programs/catalog";
import type { Application } from "@/components/marketing/application-form";
import { useState } from "react";

const learningModes = ["Online live", "Online self-paced", "Hybrid"];
type FieldsProps = {
  application: Application;
  isAuthenticated: boolean;
  onChange: (field: keyof Application, value: string) => void;
  step: number;
};

function Field({
  children,
  label,
  optional = false,
}: {
  children: React.ReactNode;
  label: string;
  optional?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-white/85">
      <span>
        {label}
        {optional && <span className="ml-1 text-white/45">(optional)</span>}
      </span>
      {children}
    </label>
  );
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-white/10 py-3 last:border-0">
      <p className="text-xs font-semibold uppercase tracking-[.12em] text-white/45">
        {label}
      </p>
      <p className="mt-1 text-sm leading-6 text-white/90">
        {value || "Not provided"}
      </p>
    </div>
  );
}

function SelectMenu({
  label,
  options,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
        }}
        className={`flex h-12 w-full items-center justify-between rounded-xl border px-3 text-left text-base transition ${open ? "border-fuchsia-300 bg-white/[.07]" : "border-white/15 bg-white/[.04] hover:border-white/25"}`}
      >
        <span className={value ? "text-white" : "text-white/65"}>
          {value || placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-white/60 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div
          role="listbox"
          aria-label={label}
          className="absolute z-30 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-white/15 bg-[#151621]/95 p-1.5 shadow-[0_20px_50px_rgba(0,0,0,.4)] backdrop-blur-xl"
        >
          {options.map((option) => (
            <button
              key={option}
              type="button"
              role="option"
              aria-selected={value === option}
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition ${value === option ? "bg-fuchsia-300/15 text-fuchsia-100" : "text-white/78 hover:bg-white/8 hover:text-white"}`}
            >
              <span>{option}</span>
              {value === option && <Check className="h-4 w-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ApplicationFields({
  application,
  isAuthenticated,
  onChange,
  step,
}: FieldsProps) {
  if (step === 0)
    return (
      <div className="grid gap-5">
        <Field label="Course / Program">
          <SelectMenu
            label="Course / Program"
            options={marketingPrograms.map((program) => program.title)}
            value={application.course}
            onChange={(value) => onChange("course", value)}
            placeholder="Select a program"
          />
        </Field>
        <Field label="Learning Mode">
          <SelectMenu
            label="Learning Mode"
            options={learningModes}
            value={application.learningMode}
            onChange={(value) => onChange("learningMode", value)}
            placeholder="Select a learning mode"
          />
        </Field>
      </div>
    );
  if (step === 1)
    return (
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full Name">
          <input
            value={application.fullName}
            onChange={(event) => onChange("fullName", event.target.value)}
            className="form-field sm:col-span-2"
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            value={application.email}
            onChange={(event) => onChange("email", event.target.value)}
            className="form-field"
          />
        </Field>
        <Field label="Phone Number">
          <input
            type="tel"
            value={application.phone}
            onChange={(event) => onChange("phone", event.target.value)}
            className="form-field"
          />
        </Field>
        <Field label="Date of Birth" optional>
          <input
            type="date"
            value={application.dateOfBirth}
            onChange={(event) => onChange("dateOfBirth", event.target.value)}
            className="form-field sm:col-span-2"
          />
        </Field>
      </div>
    );
  if (step === 2)
    return (
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Highest Qualification">
          <input
            value={application.qualification}
            onChange={(event) => onChange("qualification", event.target.value)}
            className="form-field"
          />
        </Field>
        <Field label="Institution Name">
          <input
            value={application.institution}
            onChange={(event) => onChange("institution", event.target.value)}
            className="form-field"
          />
        </Field>
        <Field label="Year of Completion">
          <input
            inputMode="numeric"
            maxLength={4}
            value={application.completionYear}
            onChange={(event) => onChange("completionYear", event.target.value)}
            className="form-field"
          />
        </Field>
        <Field label="Relevant Experience / Skills" optional>
          <textarea
            value={application.experience}
            onChange={(event) => onChange("experience", event.target.value)}
            className="form-field min-h-12 resize-y py-3"
          />
        </Field>
      </div>
    );
  if (step === 3)
    return isAuthenticated ? (
      <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/[.06] px-5 py-5">
        <p className="font-semibold text-white">Your account is connected</p>
        <p className="mt-2 text-sm leading-6 text-white/65">You are signed in already, so this enrollment will be linked to your existing learner account.</p>
      </div>
    ) : (
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2"><p className="text-base leading-7 text-white/65">Create your access here. Enrollment is the only new-account path.</p></div>
        <Field label="Create Password">
          <input type="password" autoComplete="new-password" value={application.password} onChange={(event) => onChange("password", event.target.value)} className="form-field" />
        </Field>
        <Field label="Confirm Password">
          <input type="password" autoComplete="new-password" value={application.confirmPassword} onChange={(event) => onChange("confirmPassword", event.target.value)} className="form-field" />
        </Field>
      </div>
    );
  return (
    <div>
      <p className="text-base leading-7 text-white/65">
        Review your information and submit your application.
      </p>
      <div className="mt-5 grid gap-x-8 rounded-2xl border border-white/10 bg-black/20 px-5 sm:grid-cols-2">
        <ReviewItem label="Course / Program" value={application.course} />
        <ReviewItem label="Learning Mode" value={application.learningMode} />
        <ReviewItem label="Full Name" value={application.fullName} />
        <ReviewItem label="Email" value={application.email} />
        <ReviewItem label="Phone Number" value={application.phone} />
        <ReviewItem label="Date of Birth" value={application.dateOfBirth} />
        <ReviewItem
          label="Highest Qualification"
          value={application.qualification}
        />
        <ReviewItem label="Institution Name" value={application.institution} />
        <ReviewItem
          label="Year of Completion"
          value={application.completionYear}
        />
        <ReviewItem
          label="Relevant Experience / Skills"
          value={application.experience}
        />
      </div>
    </div>
  );
}
