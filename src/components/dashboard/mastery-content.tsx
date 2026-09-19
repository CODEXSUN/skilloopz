"use client";

import { useEffect, useState } from "react";
import { getMasteryLevel, getMasteryColor } from "@/lib/gamification/mastery-engine";

interface MasterySkill {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  score: number;
  attempts: number;
  streak: number;
  difficulty: number;
}

interface MasteryCategory {
  category: string;
  avgScore: number;
  skillCount: number;
  skills: MasterySkill[];
}

interface MasteryOverview {
  totalSkills: number;
  masteredCount: number;
  avgScore: number;
  masteryPercentage: number;
  byCategory: MasteryCategory[];
}

interface MasteryData {
  overview: MasteryOverview;
  weakAreas: MasterySkill[];
  strongAreas: MasterySkill[];
}

export function MasteryContent() {
  const [data, setData] = useState<MasteryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    fetch("/api/gamification/mastery")
      .then((res) => res.json())
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!data || data.overview.totalSkills === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 text-4xl">🎯</div>
        <h3 className="mb-2 text-lg font-semibold">No mastery data yet</h3>
        <p className="text-sm text-muted-foreground">
          Complete lessons with quizzes to start tracking your skill mastery.
        </p>
      </div>
    );
  }

  const { overview, weakAreas, strongAreas } = data;
  const categories = ["all", ...overview.byCategory.map((c) => c.category)];
  const filteredCategories =
    selectedCategory === "all"
      ? overview.byCategory
      : overview.byCategory.filter((c) => c.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Skills Tracked" value={overview.totalSkills.toString()} icon="📊" />
        <StatCard label="Mastered" value={overview.masteredCount.toString()} icon="🏆" />
        <StatCard label="Avg Score" value={`${overview.avgScore}%`} icon="🎯" />
        <StatCard label="Mastery %" value={`${Math.round(overview.masteryPercentage)}%`} icon="📈" />
      </div>

      {/* Category Filter */}
      {overview.byCategory.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {cat === "all" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* Weak Areas Alert */}
      {weakAreas.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/50 dark:bg-amber-950/30">
          <h3 className="mb-2 flex items-center gap-2 font-semibold text-amber-800 dark:text-amber-200">
            <span>⚠️</span> Needs Practice
          </h3>
          <div className="flex flex-wrap gap-2">
            {weakAreas.slice(0, 5).map((skill) => (
              <SkillBadge key={skill.id} skill={skill} />
            ))}
          </div>
        </div>
      )}

      {/* Strong Areas */}
      {strongAreas.length > 0 && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800/50 dark:bg-emerald-950/30">
          <h3 className="mb-2 flex items-center gap-2 font-semibold text-emerald-800 dark:text-emerald-200">
            <span>💪</span> Strong Areas
          </h3>
          <div className="flex flex-wrap gap-2">
            {strongAreas.slice(0, 5).map((skill) => (
              <SkillBadge key={skill.id} skill={skill} />
            ))}
          </div>
        </div>
      )}

      {/* Category Breakdown */}
      <div className="space-y-4">
        {filteredCategories.map((cat) => (
          <div key={cat.category} className="rounded-lg border p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold capitalize">{cat.category}</h3>
              <span className="text-sm text-muted-foreground">
                Avg: {cat.avgScore}% · {cat.skillCount} skills
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {cat.skills.map((skill) => (
                <SkillCard key={skill.id} skill={skill} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="rounded-lg border p-4 text-center">
      <div className="mb-1 text-xl">{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function SkillBadge({ skill }: { skill: MasterySkill }) {
  const level = getMasteryLevel(skill.score / 100);
  const color = getMasteryColor(level);

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium"
      style={{ backgroundColor: `${color}20`, color }}
    >
      {skill.icon && <span>{skill.icon}</span>}
      {skill.name}
      <span className="text-xs opacity-70">{skill.score}%</span>
    </span>
  );
}

function SkillCard({ skill }: { skill: MasterySkill }) {
  const level = getMasteryLevel(skill.score / 100);
  const color = getMasteryColor(level);
  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset = circumference * (1 - skill.score / 100);

  return (
    <div className="flex items-center gap-3 rounded-lg border p-3 transition-shadow hover:shadow-md">
      <div className="relative h-16 w-16 flex-shrink-0">
        <svg className="h-16 w-16 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="36" fill="none" stroke="currentColor" className="text-muted" strokeWidth="6" />
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-sm font-bold">
          {skill.score}%
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          {skill.icon && <span className="text-lg">{skill.icon}</span>}
          <h4 className="truncate font-medium">{skill.name}</h4>
        </div>
        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="capitalize" style={{ color }}>
            {level}
          </span>
          <span>·</span>
          <span>{skill.attempts} attempts</span>
          {skill.streak > 0 && (
            <>
              <span>·</span>
              <span>🔥 {skill.streak}</span>
            </>
          )}
        </div>
        <div className="mt-1.5 h-1.5 w-full rounded-full bg-muted">
          <div
            className="h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${skill.score}%`, backgroundColor: color }}
          />
        </div>
      </div>
    </div>
  );
}
