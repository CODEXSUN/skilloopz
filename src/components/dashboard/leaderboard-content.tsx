"use client";

import { motion } from "framer-motion";
import { Trophy, Medal, User, Zap, Flame, ChevronUp } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const easing = [0.16, 1, 0.3, 1] as const;

interface LeaderboardEntry {
  id: string;
  fullName: string | null;
  avatarUrl: string | null;
  totalXp: number;
  level: number;
  streak: number;
}

interface Props {
  leaderboard: LeaderboardEntry[];
  currentUserId: string;
  userRank: number;
  period: string;
}

const rankStyles = [
  { border: "border-yellow-500/30", bg: "bg-yellow-500/10", icon: "text-yellow-400", label: "1st" },
  { border: "border-border/30", bg: "bg-muted/10", icon: "text-tertiary-foreground", label: "2nd" },
  { border: "border-amber-600/30", bg: "bg-amber-600/10", icon: "text-amber-500", label: "3rd" },
];

const PERIODS = [
  { key: "all", label: "All Time" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
];

export function DashboardLeaderboardContent({ leaderboard, currentUserId, userRank, period }: Props) {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: easing }}
      >
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Leaderboard
        </h1>
        <p className="mt-2 text-muted-foreground">
          Top learners ranked by XP.
        </p>
      </motion.div>

      {/* Period Tabs */}
      <div className="flex gap-2">
        {PERIODS.map((p) => (
          <Link
            key={p.key}
            href={`/dashboard/leaderboard?period=${p.key}`}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              period === p.key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {p.label}
          </Link>
        ))}
      </div>

      {leaderboard.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: easing }}
          className="glass-card flex items-center justify-center py-20"
        >
          <div className="flex flex-col items-center gap-4 text-center">
            <Trophy className="h-12 w-12 text-muted-foreground/40" />
            <div>
              <p className="text-base font-medium text-muted-foreground">No rankings yet</p>
              <p className="mt-1 text-sm text-muted-foreground/60">Complete lessons to earn XP and climb the leaderboard</p>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {leaderboard.map((entry, i) => {
            const rank = i + 1;
            const isCurrentUser = entry.id === currentUserId;
            const top3 = rank <= 3;
            const style = top3 ? rankStyles[rank - 1] : null;

            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05, ease: easing }}
                className={`group relative overflow-hidden rounded-2xl border p-5 shadow-xl transition-all duration-300 ${
                  isCurrentUser
                    ? "border-primary-500/30 bg-primary-500/5"
                    : style
                    ? `${style.border} ${style.bg}`
                    : "border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]"
                }`}
              >
                <div className="relative z-10 flex items-center gap-4">
                  {/* Rank */}
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold text-sm ${
                    top3 ? `${style?.icon}` : "text-muted-foreground"
                  }`}>
                    {top3 ? (
                      rank === 1 ? <Trophy className="h-5 w-5" /> : <Medal className="h-5 w-5" />
                    ) : (
                      <span className="text-muted-foreground">{rank}</span>
                    )}
                  </div>

                  {/* Avatar / Name */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                      isCurrentUser
                        ? "bg-primary-500/20 text-primary-400"
                        : "bg-[rgba(255,255,255,0.05)] text-muted-foreground"
                    }`}>
                      {entry.avatarUrl ? (
                        <img src={entry.avatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className={`font-semibold truncate ${
                        isCurrentUser ? "text-primary-300" : "text-foreground"
                      }`}>
                        {entry.fullName || "Anonymous Learner"}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Lvl {entry.level}</span>
                        {entry.streak > 0 && (
                          <span className="flex items-center gap-0.5">
                            <Flame className="h-3 w-3 text-orange-400" />
                            {entry.streak}
                          </span>
                        )}
                      </div>
                      {isCurrentUser && (
                        <p className="text-xs text-primary-400/70">You</p>
                      )}
                    </div>
                  </div>

                  {/* XP */}
                  <div className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-muted-foreground">
                    <Zap className="h-4 w-4 text-accent-400" />
                    {entry.totalXp.toLocaleString()} XP
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {userRank > 0 && userRank > 50 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: easing }}
          className="glass-card p-5 text-center"
        >
          <p className="text-sm text-muted-foreground">
            Your rank: <span className="font-bold text-foreground">#{userRank}</span>
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">Continue learning to break into the top 50</p>
        </motion.div>
      )}
    </div>
  );
}
