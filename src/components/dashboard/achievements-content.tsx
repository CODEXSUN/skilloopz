"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Award, Zap, Lock, BadgeCheck, Star, Gem, Crown, Shield, Sparkles } from "lucide-react";

const easing = [0.16, 1, 0.3, 1] as const;

interface AchievementItem {
  id: string;
  name: string;
  description: string;
  iconUrl: string | null;
  xpReward: number;
  earned: boolean;
}

interface BadgeItem {
  id: string;
  name: string;
  description: string;
  iconUrl: string | null;
  category: string;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  xpReward: number;
  earned: boolean;
  criteria?: string;
}

interface Props {
  achievements: AchievementItem[];
  earnedAchievementIds: Set<string>;
  badges: BadgeItem[];
  earnedBadgeIds: Set<string>;
  totalXp: number;
}

const BADGE_ICONS: Record<string, string> = {
  progress: "📈",
  quiz: "🧠",
  streak: "🔥",
  mastery: "👑",
  social: "🤝",
};

const rarityConfig: Record<string, { label: string; color: string; bg: string; border: string; icon: typeof Star }> = {
  common: { label: "Common", color: "text-gray-400", bg: "bg-gray-500/10", border: "border-gray-500/20", icon: Shield },
  uncommon: { label: "Uncommon", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20", icon: Star },
  rare: { label: "Rare", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", icon: Gem },
  epic: { label: "Epic", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", icon: Sparkles },
  legendary: { label: "Legendary", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", icon: Crown },
};

export function DashboardAchievementsContent({ achievements, earnedAchievementIds, badges, earnedBadgeIds, totalXp }: Props) {
  const [tab, setTab] = useState<"achievements" | "badges">("achievements");
  const [rarityFilter, setRarityFilter] = useState<string>("all");

  const earned = achievements.filter((a) => earnedAchievementIds.has(a.id));
  const locked = achievements.filter((a) => !earnedAchievementIds.has(a.id));
  const earnedBadges = badges.filter((b) => earnedBadgeIds.has(b.id));
  const lockedBadges = badges.filter((b) => !earnedBadgeIds.has(b.id));

  const filteredBadges = rarityFilter === "all"
    ? badges
    : badges.filter((b) => b.rarity === rarityFilter);

  const rarityCounts = {
    common: badges.filter((b) => b.rarity === "common" && earnedBadgeIds.has(b.id)).length,
    uncommon: badges.filter((b) => b.rarity === "uncommon" && earnedBadgeIds.has(b.id)).length,
    rare: badges.filter((b) => b.rarity === "rare" && earnedBadgeIds.has(b.id)).length,
    epic: badges.filter((b) => b.rarity === "epic" && earnedBadgeIds.has(b.id)).length,
    legendary: badges.filter((b) => b.rarity === "legendary" && earnedBadgeIds.has(b.id)).length,
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: easing }}
      >
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Achievements & Badges
        </h1>
        <p className="mt-2 text-muted-foreground">
          Track your milestones and earn rewards.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: easing }}
        className="grid gap-4 sm:grid-cols-4"
      >
        <div className="relative overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-5 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500/10 text-primary-400">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Achievements</p>
              <p className="text-2xl font-bold text-foreground">{earned.length}/{achievements.length}</p>
            </div>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-5 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-400">
              <BadgeCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Badges</p>
              <p className="text-2xl font-bold text-foreground">{earnedBadges.length}/{badges.length}</p>
            </div>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-5 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-500/10 text-accent-400">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total XP</p>
              <p className="text-2xl font-bold text-foreground">{totalXp}</p>
            </div>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-5 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary-500/10 text-secondary-400">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Locked</p>
              <p className="text-2xl font-bold text-foreground">{locked.length + lockedBadges.length}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Rarity Summary (Badges tab) */}
      {tab === "badges" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: easing }}
          className="flex gap-3 flex-wrap"
        >
          {Object.entries(rarityConfig).map(([key, config]) => {
            const Icon = config.icon;
            const total = badges.filter((b) => b.rarity === key).length;
            return (
              <button
                key={key}
                onClick={() => setRarityFilter(rarityFilter === key ? "all" : key)}
                className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  rarityFilter === key
                    ? `${config.bg} ${config.color} ${config.border} border`
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <Icon className="h-3 w-3" />
                {config.label}: {rarityCounts[key as keyof typeof rarityCounts]}/{total}
              </button>
            );
          })}
        </motion.div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => setTab("achievements")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            tab === "achievements"
              ? "bg-primary-500/20 text-primary-400"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Achievements
        </button>
        <button
          onClick={() => setTab("badges")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            tab === "badges"
              ? "bg-yellow-500/20 text-yellow-400"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Badges
        </button>
      </div>

      {tab === "achievements" && (
        <>
          {earned.length > 0 && (
            <div>
              <h2 className="font-heading text-lg font-bold tracking-tight text-foreground mb-4">
                Earned
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {earned.map((a, i) => (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.08, ease: easing }}
                    whileHover={{ y: -3, transition: { duration: 0.3 } }}
                    className="group relative overflow-hidden rounded-2xl border border-primary-500/20 bg-primary-500/5 p-5 shadow-xl transition-all duration-500 hover:border-primary-500/30 hover:shadow-primary-500/10"
                  >
                    <div className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-primary-500/10 blur-[50px]" />
                    <div className="relative z-10 flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-500/20 text-primary-400">
                        <Award className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{a.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{a.description}</p>
                        <p className="mt-2 text-xs text-primary-400">+{a.xpReward} XP</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {locked.length > 0 && (
            <div>
              <h2 className="font-heading text-lg font-bold tracking-tight text-foreground mb-4">
                Locked
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {locked.map((a, i) => (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.08, ease: easing }}
                    className="group relative overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.01)] p-5 shadow-xl opacity-60"
                  >
                    <div className="relative z-10 flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[rgba(255,255,255,0.03)] text-muted-foreground/40">
                        <Lock className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-semibold text-muted-foreground">{a.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground/60">{a.description}</p>
                        <p className="mt-2 text-xs text-muted-foreground/40">+{a.xpReward} XP</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {tab === "badges" && (
        <>
          {filteredBadges.filter((b) => b.earned).length > 0 && (
            <div>
              <h2 className="font-heading text-lg font-bold tracking-tight text-foreground mb-4">
                Earned
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredBadges.filter((b) => b.earned).map((b, i) => {
                  const rarity = rarityConfig[b.rarity];
                  const RarityIcon = rarity.icon;
                  return (
                    <motion.div
                      key={b.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: i * 0.08, ease: easing }}
                      whileHover={{ y: -3, transition: { duration: 0.3 } }}
                      className={`group relative overflow-hidden rounded-2xl border p-5 shadow-xl transition-all duration-500 hover:shadow-lg ${rarity.bg} ${rarity.border}`}
                    >
                      <div className={`pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full blur-[50px] ${rarity.bg}`} />
                      <div className="relative z-10 flex items-start gap-4">
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl ${rarity.bg}`}>
                          {b.iconUrl ?? BADGE_ICONS[b.category] ?? "🏅"}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-foreground">{b.name}</p>
                            <span className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${rarity.bg} ${rarity.color}`}>
                              <RarityIcon className="h-2.5 w-2.5" />
                              {rarity.label}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">{b.description}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <span className={`text-xs ${rarity.color}`}>+{b.xpReward} XP</span>
                            <span className="text-[10px] rounded-full bg-muted px-2 py-0.5 text-muted-foreground capitalize">
                              {b.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {filteredBadges.filter((b) => !b.earned).length > 0 && (
            <div>
              <h2 className="font-heading text-lg font-bold tracking-tight text-foreground mb-4">
                Locked
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredBadges.filter((b) => !b.earned).map((b, i) => {
                  const rarity = rarityConfig[b.rarity];
                  const RarityIcon = rarity.icon;
                  const criteria = (() => { try { return JSON.parse(b.criteria || "{}"); } catch { return {}; } })();
                  let progressLabel = "";
                  let progressValue = 0;
                  let progressMax = 1;

                  switch (criteria.type) {
                    case "enrollments":
                    case "bookmarks":
                    case "notes":
                    case "perfect_quizzes":
                    case "certificates":
                      progressMax = criteria.value;
                      progressLabel = `0/${criteria.value}`;
                      break;
                    case "streak":
                      progressMax = criteria.value;
                      progressLabel = `0/${criteria.value} days`;
                      break;
                    case "total_xp":
                      progressMax = criteria.value;
                      progressLabel = `0/${criteria.value.toLocaleString()} XP`;
                      break;
                    case "level":
                      progressMax = criteria.value;
                      progressLabel = `Level 1/${criteria.value}`;
                      break;
                    case "lessons_per_day":
                      progressMax = criteria.value;
                      progressLabel = `0/${criteria.value} today`;
                      break;
                  }

                  return (
                    <motion.div
                      key={b.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: i * 0.08, ease: easing }}
                      className="group relative overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.01)] p-5 shadow-xl opacity-70"
                    >
                      <div className="relative z-10 flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[rgba(255,255,255,0.03)] text-muted-foreground/40">
                          <Lock className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-muted-foreground">{b.name}</p>
                            <span className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${rarity.bg} ${rarity.color} opacity-60`}>
                              <RarityIcon className="h-2.5 w-2.5" />
                              {rarity.label}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground/60">{b.description}</p>
                          {progressLabel && (
                            <div className="mt-2 space-y-1">
                              <div className="flex justify-between text-[10px] text-muted-foreground/50">
                                <span>Progress</span>
                                <span>{progressLabel}</span>
                              </div>
                              <div className="h-1 w-full rounded-full bg-muted/30">
                                <div
                                  className={`h-1 rounded-full ${rarity.bg.replace("/10", "/30")}`}
                                  style={{ width: `${Math.max(2, (0 / progressMax) * 100)}%` }}
                                />
                              </div>
                            </div>
                          )}
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-xs text-muted-foreground/40">+{b.xpReward} XP</span>
                            <span className="text-[10px] rounded-full bg-[rgba(255,255,255,0.05)] px-2 py-0.5 text-muted-foreground/30 capitalize">
                              {b.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {achievements.length === 0 && badges.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: easing }}
          className="glass-card flex items-center justify-center py-20"
        >
          <div className="flex flex-col items-center gap-4 text-center">
            <Award className="h-12 w-12 text-muted-foreground/40" />
            <div>
              <p className="text-base font-medium text-muted-foreground">No achievements or badges yet</p>
              <p className="mt-1 text-sm text-muted-foreground/60">Complete lessons to earn rewards</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
