"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, TrendingDown, Clock, BarChart3, Target } from "lucide-react";

interface RiskFactor {
  type: string;
  severity: "low" | "medium" | "high";
  message: string;
}

interface AtRiskStudent {
  id: string;
  fullName: string | null;
  avatarUrl: string | null;
  email: string | null;
  riskScore: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  riskFactors: RiskFactor[];
  lastActive: string | null;
  courseProgress: number;
  avgQuizScore: number | null;
  streak: number;
  enrolledCourses: number;
}

interface AtRiskResponse {
  students: AtRiskStudent[];
  totalStudents: number;
  atRiskCount: number;
}

const riskLevelColors: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  critical: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/30", icon: "text-red-400" },
  high: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/30", icon: "text-orange-400" },
  medium: { bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/30", icon: "text-yellow-400" },
};

const riskFactorIcons: Record<string, typeof AlertTriangle> = {
  inactive: Clock,
  low_progress: TrendingDown,
  low_scores: BarChart3,
  low_mastery: Target,
  streak_lost: AlertTriangle,
};

export function AtRiskStudentsContent() {
  const [data, setData] = useState<AtRiskResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "critical" | "high" | "medium">("all");

  useEffect(() => {
    fetch("/api/teacher/at-risk")
      .then((res) => res.json())
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!data || data.atRiskCount === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
        <h3 className="font-semibold text-emerald-400">All students on track</h3>
        <p className="mt-1 text-sm text-muted-foreground">No at-risk students detected</p>
      </div>
    );
  }

  const filteredStudents = filter === "all"
    ? data.students
    : data.students.filter((s) => s.riskLevel === filter);

  const counts = {
    critical: data.students.filter((s) => s.riskLevel === "critical").length,
    high: data.students.filter((s) => s.riskLevel === "high").length,
    medium: data.students.filter((s) => s.riskLevel === "medium").length,
  };

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-center">
          <div className="text-2xl font-bold text-red-400">{counts.critical}</div>
          <div className="text-xs text-red-300/70">Critical</div>
        </div>
        <div className="rounded-lg border border-orange-500/30 bg-orange-500/10 p-3 text-center">
          <div className="text-2xl font-bold text-orange-400">{counts.high}</div>
          <div className="text-xs text-orange-300/70">High</div>
        </div>
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-center">
          <div className="text-2xl font-bold text-yellow-400">{counts.medium}</div>
          <div className="text-xs text-yellow-300/70">Medium</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(["all", "critical", "high", "medium"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filter === f
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {f === "all" ? `All (${data.atRiskCount})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${counts[f]})`}
          </button>
        ))}
      </div>

      {/* Student List */}
      <div className="space-y-3">
        {filteredStudents.map((student) => {
          const colors = riskLevelColors[student.riskLevel] ?? riskLevelColors.medium;
          const daysSinceActive = student.lastActive
            ? Math.floor((Date.now() - new Date(student.lastActive).getTime()) / (1000 * 60 * 60 * 24))
            : null;

          return (
            <div
              key={student.id}
              className={`rounded-lg border p-4 ${colors.border} ${colors.bg}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${colors.bg}`}>
                    {student.avatarUrl ? (
                      <img src={student.avatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
                    ) : (
                      <span className={`text-lg font-bold ${colors.text}`}>
                        {student.fullName?.charAt(0) ?? "?"}
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold">{student.fullName ?? "Unknown Student"}</h4>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{student.enrolledCourses} courses</span>
                      <span>Progress: {student.courseProgress}%</span>
                      {student.avgQuizScore !== null && <span>Avg: {student.avgQuizScore}%</span>}
                      {daysSinceActive !== null && <span>Last active: {daysSinceActive}d ago</span>}
                    </div>
                  </div>
                </div>
                <div className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase ${colors.bg} ${colors.text}`}>
                  {student.riskLevel}
                </div>
              </div>

              {/* Risk Factors */}
              <div className="mt-3 flex flex-wrap gap-2">
                {student.riskFactors.map((factor, i) => {
                  const Icon = riskFactorIcons[factor.type] ?? AlertTriangle;
                  return (
                    <span
                      key={i}
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                        factor.severity === "high"
                          ? "bg-red-500/20 text-red-300"
                          : factor.severity === "medium"
                          ? "bg-orange-500/20 text-orange-300"
                          : "bg-yellow-500/20 text-yellow-300"
                      }`}
                    >
                      <Icon className="h-3 w-3" />
                      {factor.message}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
