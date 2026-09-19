"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2, ArrowRight, ArrowLeft, Check, Sparkles,
  X, BookOpen, Beaker, Code, Palette, Music, Globe,
  History, Calculator, FlaskConical, Languages, Brain,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RoleSelector } from "@/components/auth/role-selector";
import { SkilloopzLogo } from "@/components/branding/skilloop-logo";

type Role = "student" | "teacher" | "parent";

const easing = [0.16, 1, 0.3, 1] as const;

const steps = [
  { id: "role", label: "Role" },
  { id: "details", label: "Details" },
  { id: "confirm", label: "Review" },
] as const;

type StepId = (typeof steps)[number]["id"];

const INTEREST_OPTIONS = [
  { value: "math", label: "Math", icon: Calculator },
  { value: "science", label: "Science", icon: FlaskConical },
  { value: "programming", label: "Programming", icon: Code },
  { value: "art", label: "Art", icon: Palette },
  { value: "music", label: "Music", icon: Music },
  { value: "languages", label: "Languages", icon: Languages },
  { value: "history", label: "History", icon: History },
  { value: "geography", label: "Geography", icon: Globe },
  { value: "biology", label: "Biology", icon: Beaker },
  { value: "reading", label: "Reading", icon: BookOpen },
  { value: "logic", label: "Logic", icon: Brain },
] as const;

const studentSchema = z.object({
  ageGroup: z.enum(["child", "teen", "adult"]),
  grade: z.string().optional(),
});

const teacherSchema = z.object({
  subjects: z.string().min(1, "Enter at least one subject"),
  gradeLevels: z.string().min(1, "Enter at least one grade level"),
  bio: z.string().max(500, "Bio must be under 500 characters").optional(),
});

export function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState<StepId>("role");
  const [role, setRole] = useState<Role | null>(null);
  const [childName, setChildName] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [childInterests, setChildInterests] = useState<string[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);

  const studentForm = useForm<z.infer<typeof studentSchema>>({
    resolver: zodResolver(studentSchema),
    defaultValues: { ageGroup: "teen", grade: "" },
  });

  const teacherForm = useForm<z.infer<typeof teacherSchema>>({
    resolver: zodResolver(teacherSchema),
    defaultValues: { subjects: "", gradeLevels: "", bio: "" },
  });

  const toggleInterest = useCallback((value: string) => {
    setInterests((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  }, []);

  const toggleChildInterest = useCallback((value: string) => {
    setChildInterests((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  }, []);

  const currentIdx = steps.findIndex((s) => s.id === step);

  async function handleConfirm() {
    if (!role) return;
    setSubmitting(true);
    setServerError(null);

    const metadata: Record<string, unknown> = {};

    if (role === "student") {
      const data = studentForm.getValues();
      metadata.age_group = data.ageGroup;
      if (data.grade) metadata.grade = data.grade;
      metadata.interests = interests;
    }

    if (role === "teacher") {
      const data = teacherForm.getValues();
      metadata.subjects = data.subjects.split(",").map((s) => s.trim()).filter(Boolean);
      metadata.grade_levels = data.gradeLevels.split(",").map((s) => s.trim()).filter(Boolean);
      if (data.bio) metadata.bio = data.bio;
    }

    if (role === "parent") {
      if (childName) metadata.child_name = childName;
      if (childInterests.length > 0) metadata.child_interests = childInterests;
    }

    const res = await fetch("/api/auth/role", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, metadata }),
    });

    if (!res.ok) {
      const err = await res.json();
      setServerError(err.error ?? "Something went wrong");
      setSubmitting(false);
      return;
    }

    const dashboards: Record<Role, string> = {
      student: "/dashboard",
      teacher: "/teacher",
      parent: "/dashboard",
    };
    router.push(dashboards[role]);
  }

  function nextStep() {
    if (currentIdx < steps.length - 1) {
      setStep(steps[currentIdx + 1].id);
    }
  }

  function prevStep() {
    if (currentIdx > 0) {
      setStep(steps[currentIdx - 1].id);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* ───── LEFT: Branding ───── */}
      <div className="noise aurora-cinematic relative hidden w-1/2 flex-col items-center justify-center overflow-hidden p-12 lg:flex">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-1/4 -top-1/4 h-[1000px] w-[1000px] rounded-full bg-primary-500/10 blur-[180px] animate-pulse-glow" />
          <div className="absolute -bottom-1/4 -right-1/4 h-[800px] w-[800px] rounded-full bg-accent-500/8 blur-[160px] animate-pulse-glow" style={{ animationDelay: "2.5s" }} />
          <div className="absolute inset-0 opacity-20">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute h-1.5 w-1.5 rounded-full bg-primary-400"
                animate={{ y: [0, -120, 0], x: [0, Math.sin(i * 1.5) * 60, 0], opacity: [0, 0.8, 0] }}
                transition={{ duration: 12 + i * 2, repeat: Infinity, ease: "linear", delay: i * 1.5 }}
                style={{ left: `${10 + i * 14}%`, top: `${15 + (i % 4) * 18}%` }}
              />
            ))}
          </div>
        </div>

        <div className="relative z-10 flex flex-col items-center gap-8 text-center max-w-lg">
          <SkilloopzLogo />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: easing }}
            className="glass-thick rounded-[32px] p-8 shadow-2xl"
          >
            <p className="text-lg leading-relaxed text-foreground/90">
              &ldquo;Learning should adapt to humans. Humans should not adapt to systems.&rdquo;
            </p>
          </motion.div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary-400" />
            <span>Just a few steps to get started</span>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background via-background/20 to-transparent pointer-events-none" />
      </div>

      {/* ───── RIGHT: Onboarding Form ───── */}
      <div className="relative flex w-full items-center justify-center px-6 lg:w-1/2">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(79,124,255,0.05)_0%,transparent_60%)]" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: easing }}
          className="relative z-10 w-full max-w-lg"
        >
          {/* Mobile Logo */}
          <div className="mb-8 lg:hidden">
            <Link href="/">
              <SkilloopzLogo compact />
            </Link>
          </div>

          {/* Step Progress */}
          <div className="mb-10">
            <div className="flex items-center justify-between">
              {steps.map((s, i) => (
                <div key={s.id} className="flex items-center">
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-500 ${
                        i < currentIdx
                          ? "bg-primary-500 text-white"
                          : i === currentIdx
                          ? "border-2 border-primary-500 bg-primary-500/10 text-primary-400"
                          : "border border-[rgba(255,255,255,0.1)] text-muted-foreground"
                      }`}
                    >
                      {i < currentIdx ? <Check className="h-3.5 w-3.5" /> : i + 1}
                    </div>
                    <span
                      className={`text-[11px] font-semibold uppercase tracking-wider ${
                        i <= currentIdx ? "text-primary-400" : "text-muted-foreground/50"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`mx-4 h-px w-16 transition-colors duration-500 sm:w-24 ${
                      i < currentIdx ? "bg-primary-500/50" : "bg-[rgba(255,255,255,0.08)]"
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: easing }}
            >
              {step === "role" && (
                <div className="space-y-6">
                  <div>
                    <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                      Welcome to skilloopz
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                      What best describes you? Choose your role to personalize your experience.
                    </p>
                  </div>
                  <RoleSelector selected={role} onSelect={setRole} />
                  <button
                    onClick={nextStep}
                    disabled={!role}
                    className="group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-foreground text-sm font-semibold text-background transition-all hover:shadow-glow-sm active:scale-[0.98] disabled:opacity-50"
                  >
                    Continue
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              )}

              {step === "details" && role === "student" && (
                <div className="space-y-6">
                  <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">
                    Tell us about yourself
                  </h2>

                  <div className="space-y-3">
                    <Label required>Age Group</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: "child" as const, label: "Child (<13)" },
                        { value: "teen" as const, label: "Teen (13–18)" },
                        { value: "adult" as const, label: "Adult (18+)" },
                      ].map((opt) => (
                        <label
                          key={opt.value}
                          className="group flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] px-4 py-4 text-sm text-muted-foreground transition-all has-[:checked]:border-primary-500/30 has-[:checked]:bg-primary-500/10 has-[:checked]:text-primary-400 hover:border-[rgba(255,255,255,0.15)]"
                        >
                          <input
                            type="radio"
                            value={opt.value}
                            className="sr-only"
                            {...studentForm.register("ageGroup")}
                          />
                          <span className="font-medium">{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="grade">Grade (optional)</Label>
                    <Input
                      id="grade"
                      placeholder="e.g. 5th grade"
                      className="bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.08)]"
                      {...studentForm.register("grade")}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Interests (optional)</Label>
                    <div className="flex flex-wrap gap-2">
                      {INTEREST_OPTIONS.map((opt) => {
                        const selected = interests.includes(opt.value);
                        const Icon = opt.icon;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => toggleInterest(opt.value)}
                            className={`group inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                              selected
                                ? "border-primary-500/40 bg-primary-500/15 text-primary-300 shadow-sm"
                                : "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] text-muted-foreground hover:border-[rgba(255,255,255,0.18)] hover:text-foreground"
                            }`}
                          >
                            <Icon className="h-3.5 w-3.5" />
                            {opt.label}
                            {selected && <X className="h-3 w-3 ml-0.5 text-primary-400" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={prevStep}
                      className="group flex h-12 w-20 items-center justify-center gap-2 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] text-sm font-medium text-muted-foreground transition-all hover:border-[rgba(255,255,255,0.15)] hover:text-foreground"
                    >
                      <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                      Back
                    </button>
                    <button
                      onClick={nextStep}
                      className="group flex h-12 flex-1 items-center justify-center gap-2 overflow-hidden rounded-xl bg-foreground text-sm font-semibold text-background transition-all hover:shadow-glow-sm active:scale-[0.98]"
                    >
                      Continue
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>
                </div>
              )}

              {step === "details" && role === "teacher" && (
                <div className="space-y-6">
                  <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">
                    Tell us about your teaching
                  </h2>

                  <div className="space-y-2">
                    <Label htmlFor="subjects" required>
                      Subjects you teach
                    </Label>
                    <Input
                      id="subjects"
                      placeholder="math, science, english"
                      error={teacherForm.formState.errors.subjects?.message}
                      className="bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.08)]"
                      {...teacherForm.register("subjects")}
                    />
                    <p className="text-xs text-muted-foreground">Comma-separated</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gradeLevels" required>
                      Grade levels
                    </Label>
                    <Input
                      id="gradeLevels"
                      placeholder="elementary, middle, high"
                      error={teacherForm.formState.errors.gradeLevels?.message}
                      className="bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.08)]"
                      {...teacherForm.register("gradeLevels")}
                    />
                    <p className="text-xs text-muted-foreground">Comma-separated</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Short bio (optional)</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell students a bit about yourself and your teaching style..."
                      rows={3}
                      maxLength={500}
                      className="bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.08)] resize-none"
                      error={teacherForm.formState.errors.bio?.message}
                      {...teacherForm.register("bio")}
                    />
                    <p className="text-xs text-muted-foreground">Up to 500 characters</p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={prevStep}
                      className="group flex h-12 w-20 items-center justify-center gap-2 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] text-sm font-medium text-muted-foreground transition-all hover:border-[rgba(255,255,255,0.15)] hover:text-foreground"
                    >
                      <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                      Back
                    </button>
                    <button
                      onClick={nextStep}
                      className="group flex h-12 flex-1 items-center justify-center gap-2 overflow-hidden rounded-xl bg-foreground text-sm font-semibold text-background transition-all hover:shadow-glow-sm active:scale-[0.98]"
                    >
                      Continue
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>
                </div>
              )}

              {step === "details" && role === "parent" && (
                <div className="space-y-6">
                  <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">
                    About your family
                  </h2>

                  <div className="space-y-2">
                    <Label htmlFor="childName">Child&apos;s name (optional)</Label>
                    <Input
                      id="childName"
                      value={childName}
                      onChange={(e) => setChildName(e.target.value)}
                      placeholder="Enter your child's name"
                      className="bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.08)]"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Child&apos;s interests (optional)</Label>
                    <div className="flex flex-wrap gap-2">
                      {INTEREST_OPTIONS.map((opt) => {
                        const selected = childInterests.includes(opt.value);
                        const Icon = opt.icon;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => toggleChildInterest(opt.value)}
                            className={`group inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                              selected
                                ? "border-primary-500/40 bg-primary-500/15 text-primary-300 shadow-sm"
                                : "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] text-muted-foreground hover:border-[rgba(255,255,255,0.18)] hover:text-foreground"
                            }`}
                          >
                            <Icon className="h-3.5 w-3.5" />
                            {opt.label}
                            {selected && <X className="h-3 w-3 ml-0.5 text-primary-400" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={prevStep}
                      className="group flex h-12 w-20 items-center justify-center gap-2 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] text-sm font-medium text-muted-foreground transition-all hover:border-[rgba(255,255,255,0.15)] hover:text-foreground"
                    >
                      <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                      Back
                    </button>
                    <button
                      onClick={nextStep}
                      className="group flex h-12 flex-1 items-center justify-center gap-2 overflow-hidden rounded-xl bg-foreground text-sm font-semibold text-background transition-all hover:shadow-glow-sm active:scale-[0.98]"
                    >
                      Continue
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>
                </div>
              )}

              {step === "confirm" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">
                      Almost done!
                    </h2>
                    <p className="mt-2 text-muted-foreground">
                      Review your selections and confirm
                    </p>
                  </div>

                  <div className="glass-card overflow-hidden border-dashed p-6">
                    <dl className="space-y-4 text-sm">
                      <div className="flex items-center justify-between">
                        <dt className="text-muted-foreground">Role</dt>
                        <dd className="font-semibold capitalize text-foreground">{role}</dd>
                      </div>
                      {role === "student" && (() => {
                        const sv = studentForm.getValues();
                        return (
                          <>
                            <div className="flex items-center justify-between">
                              <dt className="text-muted-foreground">Age Group</dt>
                              <dd className="font-semibold capitalize text-foreground">{sv.ageGroup}</dd>
                            </div>
                            {sv.grade && (
                              <div className="flex items-center justify-between">
                                <dt className="text-muted-foreground">Grade</dt>
                                <dd className="font-semibold text-foreground">{sv.grade}</dd>
                              </div>
                            )}
                            {interests.length > 0 && (
                              <div className="flex items-center justify-between">
                                <dt className="text-muted-foreground">Interests</dt>
                                <dd className="font-semibold text-foreground">
                                  {interests.map((i) => INTEREST_OPTIONS.find((o) => o.value === i)?.label ?? i).join(", ")}
                                </dd>
                              </div>
                            )}
                          </>
                        );
                      })()}
                      {role === "teacher" && (() => {
                        const tv = teacherForm.getValues();
                        return (
                          <>
                            <div className="flex items-center justify-between">
                              <dt className="text-muted-foreground">Subjects</dt>
                              <dd className="font-semibold text-foreground">{tv.subjects}</dd>
                            </div>
                            <div className="flex items-center justify-between">
                              <dt className="text-muted-foreground">Grade Levels</dt>
                              <dd className="font-semibold text-foreground">{tv.gradeLevels}</dd>
                            </div>
                            {tv.bio && (
                              <div className="flex items-start justify-between">
                                <dt className="text-muted-foreground">Bio</dt>
                                <dd className="max-w-[200px] text-right font-medium text-foreground">{tv.bio}</dd>
                              </div>
                            )}
                          </>
                        );
                      })()}
                      {role === "parent" && (() => (
                        <>
                          {childName && (
                            <div className="flex items-center justify-between">
                              <dt className="text-muted-foreground">Child&apos;s Name</dt>
                              <dd className="font-semibold text-foreground">{childName}</dd>
                            </div>
                          )}
                          {childInterests.length > 0 && (
                            <div className="flex items-center justify-between">
                              <dt className="text-muted-foreground">Child&apos;s Interests</dt>
                              <dd className="font-semibold text-foreground">
                                {childInterests.map((i) => INTEREST_OPTIONS.find((o) => o.value === i)?.label ?? i).join(", ")}
                              </dd>
                            </div>
                          )}
                        </>
                      ))()}
                    </dl>
                  </div>

                  {serverError && (
                    <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                      {serverError}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={prevStep}
                      className="group flex h-12 w-20 items-center justify-center gap-2 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] text-sm font-medium text-muted-foreground transition-all hover:border-[rgba(255,255,255,0.15)] hover:text-foreground"
                    >
                      <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                      Back
                    </button>
                    <button
                      onClick={handleConfirm}
                      disabled={isSubmitting}
                      className="group flex h-12 flex-1 items-center justify-center gap-2 overflow-hidden rounded-xl bg-primary-500 text-sm font-semibold text-white transition-all hover:shadow-glow-sm active:scale-[0.98] disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Setting up...
                        </>
                      ) : (
                        <>
                          Confirm & Get Started
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
