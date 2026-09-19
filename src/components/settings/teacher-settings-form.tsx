"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, Check, X, Calculator, FlaskConical, Code, Palette, Music, Languages, History, Globe, Beaker, Brain, BookOpen, User, Atom, Dna, PenTool, GraduationCap, Baby, School, University, Users, Bell, Mail, MessageSquare, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const easing = [0.16, 1, 0.3, 1] as const;

const SUBJECT_EXPERTISE_OPTIONS = [
  { value: "math", label: "Math", icon: Calculator },
  { value: "science", label: "Science", icon: FlaskConical },
  { value: "physics", label: "Physics", icon: Atom },
  { value: "chemistry", label: "Chemistry", icon: Beaker },
  { value: "biology", label: "Biology", icon: Dna },
  { value: "programming", label: "Programming", icon: Code },
  { value: "english", label: "English", icon: PenTool },
  { value: "history", label: "History", icon: History },
  { value: "geography", label: "Geography", icon: Globe },
  { value: "art", label: "Art", icon: Palette },
  { value: "music", label: "Music", icon: Music },
  { value: "languages", label: "Languages", icon: Languages },
  { value: "reading", label: "Reading", icon: BookOpen },
  { value: "logic", label: "Logic", icon: Brain },
] as const;

const GRADE_LEVEL_OPTIONS = [
  { value: "elementary", label: "Elementary (K-5)", icon: Baby },
  { value: "middle", label: "Middle (6-8)", icon: School },
  { value: "high", label: "High (9-12)", icon: GraduationCap },
  { value: "college", label: "College", icon: University },
  { value: "adult", label: "Adult Education", icon: Users },
] as const;

interface InitialData {
  fullName: string;
  email: string;
  avatarUrl: string;
  ageGroup: "child" | "teen" | "adult";
  subjectExpertise: string[];
  gradeLevels: string[];
  bio: string;
  notifyEnrollments?: boolean;
  notifyCourseComplete?: boolean;
  notifyStudentMessages?: boolean;
  notifyWeeklyReport?: boolean;
}

interface Props {
  initialData: InitialData;
}

export function TeacherSettingsForm({ initialData }: Props) {
  const router = useRouter();
  const [fullName, setFullName] = useState(initialData.fullName);
  const [avatarUrl, setAvatarUrl] = useState(initialData.avatarUrl);
  const [ageGroup, setAgeGroup] = useState(initialData.ageGroup);
  const [subjectExpertise, setSubjectExpertise] = useState<string[]>(initialData.subjectExpertise);
  const [gradeLevels, setGradeLevels] = useState<string[]>(initialData.gradeLevels);
  const [bio, setBio] = useState(initialData.bio);
  const [notifyEnrollments, setNotifyEnrollments] = useState(initialData.notifyEnrollments ?? true);
  const [notifyCourseComplete, setNotifyCourseComplete] = useState(initialData.notifyCourseComplete ?? true);
  const [notifyStudentMessages, setNotifyStudentMessages] = useState(initialData.notifyStudentMessages ?? true);
  const [notifyWeeklyReport, setNotifyWeeklyReport] = useState(initialData.notifyWeeklyReport ?? true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleSubject = useCallback((value: string) => {
    setSubjectExpertise((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  }, []);

  const toggleGradeLevel = useCallback((value: string) => {
    setGradeLevels((prev) =>
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
      subjectExpertise,
      gradeLevels,
      bio: bio || null,
      notifyEnrollments,
      notifyCourseComplete,
      notifyStudentMessages,
      notifyWeeklyReport,
    };

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
          Manage your teacher profile and preferences
        </p>
      </motion.div>

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

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: easing }}
        className="space-y-5 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-6"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500/10">
            <GraduationCap className="h-5 w-5 text-primary-400" />
          </div>
          <h2 className="font-heading text-lg font-bold text-foreground">Professional Profile</h2>
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

        <div className="space-y-3">
          <Label required>Subject Expertise</Label>
          <div className="flex flex-wrap gap-2">
            {SUBJECT_EXPERTISE_OPTIONS.map((opt) => {
              const selected = subjectExpertise.includes(opt.value);
              const Icon = opt.icon;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleSubject(opt.value)}
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

        <div className="space-y-3">
          <Label required>Grade Levels</Label>
          <div className="flex flex-wrap gap-2">
            {GRADE_LEVEL_OPTIONS.map((opt) => {
              const selected = gradeLevels.includes(opt.value);
              const Icon = opt.icon;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleGradeLevel(opt.value)}
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

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: easing }}
        className="space-y-5 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-6"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500/10">
            <Bell className="h-5 w-5 text-primary-400" />
          </div>
          <h2 className="font-heading text-lg font-bold text-foreground">Notification Preferences</h2>
        </div>

        <div className="space-y-3">
          {[
            { key: "notifyEnrollments", label: "New enrollments", desc: "Get notified when a student enrolls in your course", icon: TrendingUp, value: notifyEnrollments, setter: setNotifyEnrollments },
            { key: "notifyCourseComplete", label: "Course completions", desc: "Get notified when a student completes your course", icon: GraduationCap, value: notifyCourseComplete, setter: setNotifyCourseComplete },
            { key: "notifyStudentMessages", label: "Student messages", desc: "Get notified when a student sends you a message", icon: MessageSquare, value: notifyStudentMessages, setter: setNotifyStudentMessages },
            { key: "notifyWeeklyReport", label: "Weekly summary", desc: "Receive a weekly report on student progress", icon: Mail, value: notifyWeeklyReport, setter: setNotifyWeeklyReport },
          ].map(({ label, desc, icon: Icon, value, setter }) => (
            <div key={label} className="flex items-center justify-between rounded-xl bg-[rgba(255,255,255,0.03)] p-4">
              <div className="flex items-start gap-3">
                <Icon className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setter(!value)}
                className={`h-6 w-11 shrink-0 rounded-full transition-colors ${value ? "bg-primary-500" : "bg-[rgba(255,255,255,0.1)]"}`}
              >
                <span className={`block h-5 w-5 rounded-full bg-white transition-transform ${value ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>
          ))}
        </div>
      </motion.section>

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
