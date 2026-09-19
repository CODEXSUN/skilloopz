"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, Check, X, Calculator, FlaskConical, Code, Palette, Music, Languages, History, BookOpen, Globe, Beaker, Brain, User, Mail, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const easing = [0.16, 1, 0.3, 1] as const;

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

interface InitialData {
  fullName: string;
  email: string;
  avatarUrl: string;
  role: "student" | "teacher" | "parent";
  ageGroup: "child" | "teen" | "adult";
  grade: string;
  interests: string[];
  subjects: string[];
  gradeLevels: string[];
  bio: string;
  childName: string;
  childInterests: string[];
}

interface Props {
  initialData: InitialData;
}

export function SettingsForm({ initialData }: Props) {
  const router = useRouter();
  const [fullName, setFullName] = useState(initialData.fullName);
  const [avatarUrl, setAvatarUrl] = useState(initialData.avatarUrl);
  const [ageGroup, setAgeGroup] = useState(initialData.ageGroup);
  const [grade, setGrade] = useState(initialData.grade);
  const [interests, setInterests] = useState<string[]>(initialData.interests);
  const [subjects, setSubjects] = useState(initialData.subjects.join(", "));
  const [gradeLevels, setGradeLevels] = useState(initialData.gradeLevels.join(", "));
  const [bio, setBio] = useState(initialData.bio);
  const [childName, setChildName] = useState(initialData.childName);
  const [childInterests, setChildInterests] = useState<string[]>(initialData.childInterests);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);

    const body: Record<string, unknown> = {
      fullName: fullName || null,
      avatarUrl: avatarUrl || null,
      ageGroup,
      grade: grade || null,
      interests,
    };

    if (initialData.role === "teacher") {
      body.subjects = subjects.split(",").map((s) => s.trim()).filter(Boolean);
      body.gradeLevels = gradeLevels.split(",").map((s) => s.trim()).filter(Boolean);
      body.bio = bio || null;
    }

    if (initialData.role === "parent") {
      body.childName = childName || null;
      body.childInterests = childInterests;
    }

    const res = await fetch("/api/auth/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json();
      setError(err.error ?? "Failed to save");
      setSaving(false);
      return;
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easing }}
      >
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Settings
        </h1>
        <p className="mt-1 text-muted-foreground">
          Manage your profile and preferences
        </p>
      </motion.div>

      {/* ── Profile Section ── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.05, ease: easing }}
        className="space-y-5 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-6"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500/10">
            <User className="h-5 w-5 text-primary-400" />
          </div>
          <h2 className="font-heading text-lg font-bold text-foreground">Profile</h2>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={initialData.email}
              disabled
              className="bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.08)] opacity-60"
            />
            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name"
              className="bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.08)]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatarUrl">Avatar URL</Label>
            <Input
              id="avatarUrl"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              className="bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.08)]"
            />
          </div>
        </div>
      </motion.section>

      {/* ── Student Section ── */}
      {initialData.role === "student" && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: easing }}
          className="space-y-5 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-6"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500/10">
              <Sparkles className="h-5 w-5 text-primary-400" />
            </div>
            <h2 className="font-heading text-lg font-bold text-foreground">Learning Profile</h2>
          </div>

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
                    checked={ageGroup === opt.value}
                    onChange={() => setAgeGroup(opt.value)}
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
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              placeholder="e.g. 5th grade"
              className="bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.08)]"
            />
          </div>

          <div className="space-y-3">
            <Label>Interests</Label>
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
        </motion.section>
      )}

      {/* ── Teacher Section ── */}
      {initialData.role === "teacher" && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: easing }}
          className="space-y-5 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-6"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500/10">
              <Sparkles className="h-5 w-5 text-primary-400" />
            </div>
            <h2 className="font-heading text-lg font-bold text-foreground">Teaching Profile</h2>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subjects" required>
              Subjects you teach
            </Label>
            <Input
              id="subjects"
              value={subjects}
              onChange={(e) => setSubjects(e.target.value)}
              placeholder="math, science, english"
              className="bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.08)]"
            />
            <p className="text-xs text-muted-foreground">Comma-separated</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gradeLevels" required>
              Grade levels
            </Label>
            <Input
              id="gradeLevels"
              value={gradeLevels}
              onChange={(e) => setGradeLevels(e.target.value)}
              placeholder="elementary, middle, high"
              className="bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.08)]"
            />
            <p className="text-xs text-muted-foreground">Comma-separated</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Short bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell students about yourself..."
              rows={3}
              maxLength={500}
              className="bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.08)] resize-none"
            />
            <p className="text-xs text-muted-foreground">Up to 500 characters</p>
          </div>
        </motion.section>
      )}

      {/* ── Parent Section ── */}
      {initialData.role === "parent" && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: easing }}
          className="space-y-5 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-6"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500/10">
              <Sparkles className="h-5 w-5 text-primary-400" />
            </div>
            <h2 className="font-heading text-lg font-bold text-foreground">Family Profile</h2>
          </div>

          <div className="space-y-2">
            <Label htmlFor="childName">Child&apos;s name</Label>
            <Input
              id="childName"
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              placeholder="Enter your child's name"
              className="bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.08)]"
            />
          </div>

          <div className="space-y-3">
            <Label>Child&apos;s interests</Label>
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
        </motion.section>
      )}

      {/* ── Save ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: easing }}
        className="flex items-center gap-4"
      >
        <button
          onClick={handleSave}
          disabled={saving}
          className="group flex h-12 items-center justify-center gap-2 rounded-xl bg-primary-500 px-6 text-sm font-semibold text-white transition-all hover:shadow-glow-sm active:scale-[0.98] disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save changes
            </>
          )}
        </button>

        {saved && (
          <span className="flex items-center gap-1.5 text-sm font-medium text-green-400">
            <Check className="h-4 w-4" />
            Saved
          </span>
        )}

        {error && (
          <span className="text-sm text-red-400">{error}</span>
        )}
      </motion.div>
    </div>
  );
}
