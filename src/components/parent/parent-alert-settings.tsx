"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Check, Loader2 } from "lucide-react";

const easing = [0.16, 1, 0.3, 1] as const;

interface AlertConfig {
  streakThreshold: number;
  inactivityDays: number;
  quizScoreThreshold: number;
  notifyStreakDrop: boolean;
  notifyInactivity: boolean;
  notifyLowScores: boolean;
  notifyCourseComplete: boolean;
}

interface Props {
  initialConfig: AlertConfig;
}

export function ParentAlertSettings({ initialConfig }: Props) {
  const [config, setConfig] = useState<AlertConfig>(initialConfig);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/parent/alerts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch {
      // Silently fail
    } finally {
      setSaving(false);
    }
  }

  function toggle(key: keyof AlertConfig) {
    setConfig((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function updateNumber(key: keyof AlertConfig, value: number) {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2, ease: easing }}
      className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-6 shadow-xl"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary-400" />
          <h2 className="font-heading text-lg font-bold text-foreground">Alert Preferences</h2>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-primary-500/20 px-3 py-1.5 text-xs font-medium text-primary-400 transition-colors hover:bg-primary-500/30 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : saved ? (
            <Check className="h-3 w-3" />
          ) : null}
          {saving ? "Saving..." : saved ? "Saved!" : "Save"}
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-xl bg-[rgba(255,255,255,0.03)] p-4">
          <div>
            <p className="text-sm font-medium text-foreground">Streak drop alert</p>
            <p className="text-xs text-muted-foreground">Alert when streak falls below threshold</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={1}
              max={14}
              value={config.streakThreshold}
              onChange={(e) => updateNumber("streakThreshold", parseInt(e.target.value) || 1)}
              className="w-16 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] px-2 py-1 text-center text-sm text-foreground focus:border-primary-500/30 focus:outline-none"
            />
            <span className="text-xs text-muted-foreground">days</span>
            <button
              onClick={() => toggle("notifyStreakDrop")}
              className={`h-6 w-11 rounded-full transition-colors ${config.notifyStreakDrop ? "bg-primary-500" : "bg-[rgba(255,255,255,0.1)]"}`}
            >
              <span className={`block h-5 w-5 rounded-full bg-white transition-transform ${config.notifyStreakDrop ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-[rgba(255,255,255,0.03)] p-4">
          <div>
            <p className="text-sm font-medium text-foreground">Inactivity alert</p>
            <p className="text-xs text-muted-foreground">Alert after days of no activity</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={1}
              max={30}
              value={config.inactivityDays}
              onChange={(e) => updateNumber("inactivityDays", parseInt(e.target.value) || 1)}
              className="w-16 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] px-2 py-1 text-center text-sm text-foreground focus:border-primary-500/30 focus:outline-none"
            />
            <span className="text-xs text-muted-foreground">days</span>
            <button
              onClick={() => toggle("notifyInactivity")}
              className={`h-6 w-11 rounded-full transition-colors ${config.notifyInactivity ? "bg-primary-500" : "bg-[rgba(255,255,255,0.1)]"}`}
            >
              <span className={`block h-5 w-5 rounded-full bg-white transition-transform ${config.notifyInactivity ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-[rgba(255,255,255,0.03)] p-4">
          <div>
            <p className="text-sm font-medium text-foreground">Low quiz score alert</p>
            <p className="text-xs text-muted-foreground">Alert when quiz scores drop below threshold</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={0}
              max={100}
              value={config.quizScoreThreshold}
              onChange={(e) => updateNumber("quizScoreThreshold", parseInt(e.target.value) || 0)}
              className="w-16 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] px-2 py-1 text-center text-sm text-foreground focus:border-primary-500/30 focus:outline-none"
            />
            <span className="text-xs text-muted-foreground">%</span>
            <button
              onClick={() => toggle("notifyLowScores")}
              className={`h-6 w-11 rounded-full transition-colors ${config.notifyLowScores ? "bg-primary-500" : "bg-[rgba(255,255,255,0.1)]"}`}
            >
              <span className={`block h-5 w-5 rounded-full bg-white transition-transform ${config.notifyLowScores ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-[rgba(255,255,255,0.03)] p-4">
          <div>
            <p className="text-sm font-medium text-foreground">Course completion alert</p>
            <p className="text-xs text-muted-foreground">Alert when child completes a course</p>
          </div>
          <button
            onClick={() => toggle("notifyCourseComplete")}
            className={`h-6 w-11 rounded-full transition-colors ${config.notifyCourseComplete ? "bg-primary-500" : "bg-[rgba(255,255,255,0.1)]"}`}
          >
            <span className={`block h-5 w-5 rounded-full bg-white transition-transform ${config.notifyCourseComplete ? "translate-x-5" : "translate-x-0.5"}`} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
