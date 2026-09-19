"use client";

import { useState } from "react";
import { Bell, Loader2, Check } from "lucide-react";
import { motion } from "framer-motion";

const easing = [0.16, 1, 0.3, 1] as const;

interface NotificationPreferences {
  notifyXp: boolean;
  notifyAchievements: boolean;
  notifyStreaks: boolean;
  notifyCourseUpdates: boolean;
  notifyMessages: boolean;
  notifyGrading: boolean;
}

interface Props {
  initial: NotificationPreferences;
}

const OPTIONS: { key: keyof NotificationPreferences; label: string; description: string }[] = [
  { key: "notifyXp", label: "XP & Level ups", description: "Get notified when you earn XP or level up" },
  { key: "notifyAchievements", label: "Achievements", description: "Get notified when you unlock achievements" },
  { key: "notifyStreaks", label: "Streak reminders", description: "Get reminded to maintain your learning streak" },
  { key: "notifyCourseUpdates", label: "Course updates", description: "Get notified when enrolled courses are updated or published" },
  { key: "notifyMessages", label: "Teacher messages", description: "Get notified when teachers send you messages" },
  { key: "notifyGrading", label: "Grading alerts", description: "Get notified when assignments or quizzes are graded" },
];

export function NotificationSettings({ initial }: Props) {
  const [preferences, setPreferences] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function toggle(key: keyof NotificationPreferences) {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);

    const res = await fetch("/api/settings/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ preferences }),
    });

    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: easing }}
      className="space-y-5 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500/10">
            <Bell className="h-5 w-5 text-primary-400" />
          </div>
          <h2 className="font-heading text-lg font-bold text-foreground">Notifications</h2>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="flex items-center gap-1.5 text-sm font-medium text-green-400">
              <Check className="h-4 w-4" />
              Saved
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex h-8 items-center justify-center gap-1.5 rounded-lg bg-primary-500 px-4 text-xs font-semibold text-white transition-all hover:shadow-glow-sm active:scale-[0.98] disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save"}
          </button>
        </div>
      </div>

      <div className="space-y-1">
        {OPTIONS.map((opt) => (
          <label
            key={opt.key}
            className="flex cursor-pointer items-center justify-between rounded-xl px-4 py-3 transition-colors hover:bg-[rgba(255,255,255,0.03)]"
          >
            <div>
              <p className="text-sm font-medium text-foreground">{opt.label}</p>
              <p className="text-xs text-muted-foreground">{opt.description}</p>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={preferences[opt.key]}
                onChange={() => toggle(opt.key)}
              />
              <div
                className={`h-6 w-11 rounded-full transition-colors ${
                  preferences[opt.key] ? "bg-primary-500" : "bg-muted"
                }`}
              >
                <div
                  className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                    preferences[opt.key] ? "translate-x-[22px]" : "translate-x-0.5"
                  }`}
                />
              </div>
            </div>
          </label>
        ))}
      </div>
    </motion.section>
  );
}
