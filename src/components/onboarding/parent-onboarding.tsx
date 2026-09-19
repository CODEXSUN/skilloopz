"use client";

import { Calculator, FlaskConical, Code, Palette, Music, Languages, History, Globe, Beaker, BookOpen, Brain, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const CHILD_INTEREST_OPTIONS = [
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

export function ParentOnboarding({ step, data, onUpdate }: Props) {
  const childInterests = (data.childInterests as string[]) ?? [];

  function toggleChildInterest(value: string) {
    onUpdate({
      childInterests: childInterests.includes(value)
        ? childInterests.filter((v) => v !== value)
        : [...childInterests, value],
    });
  }

  if (step === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground">Your profile</h2>
          <p className="mt-1 text-sm text-muted-foreground">Set up your parent account</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Your name</Label>
            <Input
              id="fullName"
              value={(data.fullName as string) ?? ""}
              onChange={(e) => onUpdate({ fullName: e.target.value })}
              placeholder="Your full name"
            />
          </div>
        </div>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground">About your child</h2>
          <p className="mt-1 text-sm text-muted-foreground">We'll personalize their learning experience</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="childName">Child&apos;s name</Label>
            <Input
              id="childName"
              value={(data.childName as string) ?? ""}
              onChange={(e) => onUpdate({ childName: e.target.value })}
              placeholder="Your child's name"
            />
          </div>

          <div className="space-y-3">
            <Label>Child&apos;s age group</Label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "child", label: "Child", desc: "Under 13" },
                { value: "teen", label: "Teen", desc: "13–18" },
                { value: "adult", label: "Adult", desc: "18+" },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`flex cursor-pointer flex-col items-center gap-1 rounded-xl border p-4 text-center transition-all ${
                    data.childAgeGroup === opt.value
                      ? "border-primary-500/30 bg-primary-500/10"
                      : "border-border hover:border-[rgba(255,255,255,0.15)]"
                  }`}
                >
                  <input
                    type="radio"
                    name="childAgeGroup"
                    value={opt.value}
                    className="sr-only"
                    checked={data.childAgeGroup === opt.value}
                    onChange={() => onUpdate({ childAgeGroup: opt.value })}
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

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-foreground">Child&apos;s interests</h2>
        <p className="mt-1 text-sm text-muted-foreground">Select subjects your child enjoys</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {CHILD_INTEREST_OPTIONS.map((opt) => {
          const selected = childInterests.includes(opt.value);
          const Icon = opt.icon;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggleChildInterest(opt.value)}
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
