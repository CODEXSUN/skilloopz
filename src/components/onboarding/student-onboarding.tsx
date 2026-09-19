"use client";

import { Calculator, FlaskConical, Code, Palette, Music, Languages, History, Globe, Beaker, BookOpen, Brain, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
];

interface Props {
  step: number;
  data: Record<string, unknown>;
  onUpdate: (partial: Record<string, unknown>) => void;
}

export function StudentOnboarding({ step, data, onUpdate }: Props) {
  const interests = (data.interests as string[]) ?? [];

  function toggleInterest(value: string) {
    onUpdate({
      interests: interests.includes(value)
        ? interests.filter((v) => v !== value)
        : [...interests, value],
    });
  }

  if (step === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground">Tell us about yourself</h2>
          <p className="mt-1 text-sm text-muted-foreground">We'll use this to personalize your experience</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Your name</Label>
            <Input
              id="fullName"
              value={(data.fullName as string) ?? ""}
              onChange={(e) => onUpdate({ fullName: e.target.value })}
              placeholder="What should we call you?"
            />
          </div>

          <div className="space-y-3">
            <Label>Age group</Label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "child", label: "Child", desc: "Under 13" },
                { value: "teen", label: "Teen", desc: "13–18" },
                { value: "adult", label: "Adult", desc: "18+" },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`flex cursor-pointer flex-col items-center gap-1 rounded-xl border p-4 text-center transition-all ${
                    data.ageGroup === opt.value
                      ? "border-primary-500/30 bg-primary-500/10"
                      : "border-border hover:border-[rgba(255,255,255,0.15)]"
                  }`}
                >
                  <input
                    type="radio"
                    name="ageGroup"
                    value={opt.value}
                    className="sr-only"
                    checked={data.ageGroup === opt.value}
                    onChange={() => onUpdate({ ageGroup: opt.value })}
                  />
                  <span className="text-sm font-medium text-foreground">{opt.label}</span>
                  <span className="text-[10px] text-muted-foreground">{opt.desc}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground">What interests you?</h2>
          <p className="mt-1 text-sm text-muted-foreground">Select all that apply — we'll recommend relevant courses</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {INTEREST_OPTIONS.map((opt) => {
            const selected = interests.includes(opt.value);
            const Icon = opt.icon;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleInterest(opt.value)}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                  selected
                    ? "border-primary-500/40 bg-primary-500/15 text-primary-300"
                    : "border-[rgba(255,255,255,0.08)] text-muted-foreground hover:border-[rgba(255,255,255,0.18)]"
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
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-foreground">What are your goals?</h2>
        <p className="mt-1 text-sm text-muted-foreground">This helps us tailor your learning path</p>
      </div>

      <div className="space-y-3">
        {[
          { value: "learn_new", label: "Learn something new", desc: "Explore new subjects and skills" },
          { value: "improve_grades", label: "Improve my grades", desc: "Get better at school subjects" },
          { value: "prepare_exam", label: "Prepare for exams", desc: "Study for upcoming tests" },
          { value: "hobby", label: "Pursue a hobby", desc: "Learn for fun and personal growth" },
          { value: "career", label: "Career development", desc: "Build skills for my future career" },
        ].map((goal) => (
          <label
            key={goal.value}
            className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-all ${
              data.goals === goal.value
                ? "border-primary-500/30 bg-primary-500/10"
                : "border-border hover:border-[rgba(255,255,255,0.15)]"
            }`}
          >
            <input
              type="radio"
              name="goals"
              value={goal.value}
              className="sr-only"
              checked={data.goals === goal.value}
              onChange={() => onUpdate({ goals: goal.value })}
            />
            <div>
              <p className="text-sm font-medium text-foreground">{goal.label}</p>
              <p className="text-xs text-muted-foreground">{goal.desc}</p>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
