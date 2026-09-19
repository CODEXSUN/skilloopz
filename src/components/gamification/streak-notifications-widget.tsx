"use client";

import { useState, useEffect } from "react";
import { Flame, AlertTriangle, Trophy, RefreshCw, Target, ChevronRight } from "lucide-react";
import Link from "next/link";

interface StreakNotification {
  type: "warning" | "milestone" | "recovery" | "freeze_available";
  title: string;
  message: string;
  action?: { label: string; href: string };
}

interface StreakHistoryEntry {
  date: string;
  active: boolean;
}

interface StreakNotificationsData {
  notifications: StreakNotification[];
  history?: StreakHistoryEntry[];
}

const typeIcons: Record<string, typeof Flame> = {
  warning: AlertTriangle,
  milestone: Trophy,
  recovery: RefreshCw,
  freeze_available: Target,
};

const typeColors: Record<string, string> = {
  warning: "border-amber-500/30 bg-amber-500/5",
  milestone: "border-emerald-500/30 bg-emerald-500/5",
  recovery: "border-blue-500/30 bg-blue-500/5",
  freeze_available: "border-purple-500/30 bg-purple-500/5",
};

export function StreakNotificationsWidget() {
  const [data, setData] = useState<StreakNotificationsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/gamification/streak/notifications?history=true&days=14")
      .then((res) => res.json())
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!data || data.notifications.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {data.notifications.map((notification, i) => {
        const Icon = typeIcons[notification.type] ?? Flame;
        const colors = typeColors[notification.type] ?? typeColors.milestone;

        return (
          <div
            key={i}
            className={`rounded-lg border p-3 ${colors}`}
          >
            <div className="flex items-start gap-3">
              <Icon className={`mt-0.5 h-5 w-5 flex-shrink-0 ${
                notification.type === "warning" ? "text-amber-400" :
                notification.type === "milestone" ? "text-emerald-400" :
                notification.type === "recovery" ? "text-blue-400" :
                "text-purple-400"
              }`} />
              <div className="flex-1">
                <h4 className="text-sm font-semibold">{notification.title}</h4>
                <p className="mt-0.5 text-xs text-muted-foreground">{notification.message}</p>
                {notification.action && (
                  <Link
                    href={notification.action.href}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    {notification.action.label}
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Streak Heatmap */}
      {data.history && data.history.length > 0 && (
        <div className="rounded-lg border p-3">
          <h4 className="mb-2 text-xs font-semibold text-muted-foreground">Last 14 Days</h4>
          <div className="flex gap-1">
            {data.history.map((day, i) => (
              <div
                key={day.date}
                className={`h-6 flex-1 rounded-sm transition-colors ${
                  day.active
                    ? "bg-primary/60 hover:bg-primary/80"
                    : "bg-muted/30"
                }`}
                title={`${day.date}: ${day.active ? "Active" : "Inactive"}`}
              />
            ))}
          </div>
          <div className="mt-1.5 flex justify-between text-[10px] text-muted-foreground/50">
            <span>14 days ago</span>
            <span>Today</span>
          </div>
        </div>
      )}
    </div>
  );
}
