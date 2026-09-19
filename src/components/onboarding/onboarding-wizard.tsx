"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, ChevronRight, Loader2, Sparkles, BookOpen, Users, Heart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StudentOnboarding } from "@/components/onboarding/student-onboarding";
import { TeacherOnboarding } from "@/components/onboarding/teacher-onboarding";
import { ParentOnboarding } from "@/components/onboarding/parent-onboarding";

const easing = [0.16, 1, 0.3, 1] as const;

interface Props {
  role: string;
  email: string;
}

const ROLE_CONFIG: Record<string, { icon: typeof Sparkles; title: string; subtitle: string; steps: string[] }> = {
  student: {
    icon: BookOpen,
    title: "Welcome to NEOT!",
    subtitle: "Let's personalize your learning experience",
    steps: ["Your Profile", "Interests", "Goals"],
  },
  teacher: {
    icon: Users,
    title: "Welcome, Educator!",
    subtitle: "Set up your teaching profile",
    steps: ["Your Profile", "Expertise", "Bio"],
  },
  parent: {
    icon: Heart,
    title: "Welcome, Parent!",
    subtitle: "Set up your family learning profile",
    steps: ["Your Profile", "Child Info", "Preferences"],
  },
};

export function OnboardingWizard({ role, email }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<Record<string, unknown>>({});

  const config = ROLE_CONFIG[role] ?? ROLE_CONFIG.student;
  const Icon = config.icon;
  const totalSteps = config.steps.length;
  const progress = ((step + 1) / totalSteps) * 100;

  function updateStepData(partial: Record<string, unknown>) {
    setData((prev) => ({ ...prev, ...partial }));
  }

  async function handleComplete(finalData: Record<string, unknown>) {
    setSaving(true);
    try {
      const res = await fetch("/api/auth/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, ...finalData }),
      });
      if (!res.ok) throw new Error("Failed to complete onboarding");

      const dashboards: Record<string, string> = {
        student: "/dashboard",
        teacher: "/teacher",
        parent: "/parent",
        admin: "/admin",
      };
      router.push(dashboards[role] ?? "/dashboard");
      router.refresh();
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  }

  function handleNext() {
    if (step < totalSteps - 1) {
      setStep((s) => s + 1);
    }
  }

  function handleBack() {
    if (step > 0) {
      setStep((s) => s - 1);
    }
  }

  const isLastStep = step === totalSteps - 1;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-lg">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Icon className="h-5 w-5 text-primary-400" />
              <span className="text-sm font-medium text-foreground">{config.title}</span>
            </div>
            <span className="text-xs text-muted-foreground">
              Step {step + 1} of {totalSteps}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-primary-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: easing }}
            />
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-2 mb-8">
          {config.steps.map((label, i) => (
            <div key={label} className="flex items-center gap-2 flex-1">
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                  i < step
                    ? "bg-primary-500 text-white"
                    : i === step
                    ? "bg-primary-500/20 text-primary-400 border border-primary-500/30"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span
                className={`hidden sm:block text-xs font-medium truncate ${
                  i <= step ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
              {i < totalSteps - 1 && (
                <div className={`hidden sm:block flex-1 h-px ${i < step ? "bg-primary-500" : "bg-muted"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: easing }}
        >
          {role === "student" && (
            <StudentOnboarding step={step} data={data} onUpdate={updateStepData} />
          )}
          {role === "teacher" && (
            <TeacherOnboarding step={step} data={data} onUpdate={updateStepData} />
          )}
          {role === "parent" && (
            <ParentOnboarding step={step} data={data} onUpdate={updateStepData} />
          )}
          {role === "admin" && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Admin accounts skip onboarding.</p>
              <Button className="mt-4" onClick={() => router.push("/admin")}>
                Go to Dashboard
              </Button>
            </div>
          )}
        </motion.div>

        {/* Navigation */}
        {role !== "admin" && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={step === 0 || saving}
              className="text-muted-foreground"
            >
              Back
            </Button>

            {isLastStep ? (
              <Button
                onClick={() => handleComplete({})}
                disabled={saving}
                className="gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    Get Started
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={handleNext} className="gap-2">
                Continue
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
