"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, CheckCheck, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  readAt: string | null;
  createdAt: string;
}

export function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function fetchNotifications() {
      fetch("/api/notifications")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) {
            setNotifications(data.notifications);
            setUnreadCount(data.unreadCount);
          }
        })
        .catch(() => {});
    }

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleMarkRead = async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, { method: "POST" });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const handleMarkAllRead = async () => {
    await fetch("/api/notifications/read-all", { method: "POST" });
    setNotifications((prev) => prev.map((n) => ({ ...n, readAt: new Date().toISOString() })));
    setUnreadCount(0);
  };

  const handleNotificationClick = useCallback(async (n: NotificationItem) => {
    if (!n.readAt) {
      await fetch(`/api/notifications/${n.id}/read`, { method: "POST" });
      setNotifications((prev) =>
        prev.map((x) => (x.id === n.id ? { ...x, readAt: new Date().toISOString() } : x)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    setOpen(false);
    if (n.link) router.push(n.link);
  }, [router]);

  const typeColors: Record<string, string> = {
    achievement_unlocked: "bg-primary-500/20 text-primary-400",
    course_completed: "bg-emerald-500/20 text-emerald-400",
    level_up: "bg-amber-500/20 text-amber-400",
    quiz_result: "bg-violet-500/20 text-violet-400",
    streak_milestone: "bg-orange-500/20 text-orange-400",
    streak_reminder: "bg-orange-500/20 text-orange-400",
    course_published: "bg-sky-500/20 text-sky-400",
    message: "bg-blue-500/20 text-blue-400",
    grading_alert: "bg-yellow-500/20 text-yellow-400",
    xp_gained: "bg-green-500/20 text-green-400",
    info: "bg-accent-500/20 text-accent-400",
  };

  const typeIcons: Record<string, string> = {
    achievement_unlocked: "🏆",
    course_completed: "🎓",
    level_up: "⬆",
    quiz_result: "📝",
    streak_milestone: "🔥",
    streak_reminder: "⏰",
    course_published: "📢",
    message: "💬",
    grading_alert: "📊",
    xp_gained: "✨",
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] transition-colors hover:bg-[rgba(255,255,255,0.08)]"
      >
        <Bell className="h-4 w-4 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-full mt-2 w-80 overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(10,12,16,0.98)] shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.06)] px-4 py-3">
              <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1 text-xs text-primary-400 transition-colors hover:text-primary-300"
                >
                  <CheckCheck className="h-3 w-3" />
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-10 text-center">
                  <Bell className="h-8 w-8 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground/60">No notifications yet</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleNotificationClick(n)}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleNotificationClick(n); }}
                    className={`group flex cursor-pointer items-start gap-3 border-b border-[rgba(255,255,255,0.04)] px-4 py-3 transition-colors hover:bg-[rgba(255,255,255,0.03)] ${!n.readAt ? "bg-[rgba(79,124,255,0.03)]" : ""}`}
                  >
                    <div
                      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] ${typeColors[n.type] || typeColors.info}`}
                    >
                      {typeIcons[n.type] || "ℹ"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">{n.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground/70">{n.message}</p>
                      <p className="mt-1 text-[10px] text-muted-foreground/40">
                        {timeAgo(new Date(n.createdAt))}
                      </p>
                    </div>
                    {!n.readAt && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleMarkRead(n.id); }}
                        className="mt-1 shrink-0 rounded-md p-1 text-muted-foreground/40 opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
