"use client";

import { useState, useEffect } from "react";
import { Target, TrendingUp, AlertTriangle, CheckCircle, BarChart3 } from "lucide-react";

interface SkillBreakdown {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  category: string;
  avgScore: number;
  studentCount: number;
  masteredCount: number;
  strugglingCount: number;
  masteryRate: number;
}

interface StudentSummary {
  id: string;
  fullName: string | null;
  avatarUrl: string | null;
  avgScore: number;
  avgProgress: number;
  skillsTracked: number;
  masteredSkills: number;
  strugglingSkills: number;
}

interface CourseOption {
  id: string;
  title: string;
}

interface MasteryData {
  courses: CourseOption[];
  overallMastery: number;
  skillBreakdown: SkillBreakdown[];
  studentSummaries: StudentSummary[];
  totalStudents: number;
  totalMasteryRecords: number;
}

export function TeacherMasteryOverview() {
  const [data, setData] = useState<MasteryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<string>("");

  const fetchData = (courseId?: string) => {
    const params = courseId ? `?courseId=${courseId}` : "";
    fetch(`/api/teacher/mastery${params}`)
      .then((res) => res.json())
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!data || data.totalStudents === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted/30">
          <Target className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-muted-foreground">No mastery data available</h3>
        <p className="mt-1 text-sm text-muted-foreground/60">Students need to complete lessons with quizzes to generate mastery data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Course Filter */}
      {data.courses.length > 1 && (
        <div className="flex gap-2">
          <button
            onClick={() => { setSelectedCourse(""); fetchData(); }}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              !selectedCourse ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            All Courses
          </button>
          {data.courses.map((course) => (
            <button
              key={course.id}
              onClick={() => { setSelectedCourse(course.id); fetchData(course.id); }}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                selectedCourse === course.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {course.title}
            </button>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-lg border p-4 text-center">
          <div className="text-2xl font-bold">{data.totalStudents}</div>
          <div className="text-xs text-muted-foreground">Students</div>
        </div>
        <div className="rounded-lg border p-4 text-center">
          <div className="text-2xl font-bold">{data.totalMasteryRecords}</div>
          <div className="text-xs text-muted-foreground">Skill Records</div>
        </div>
        <div className="rounded-lg border p-4 text-center">
          <div className="text-2xl font-bold">{data.overallMastery}%</div>
          <div className="text-xs text-muted-foreground">Avg Mastery</div>
        </div>
        <div className="rounded-lg border p-4 text-center">
          <div className="text-2xl font-bold">{data.skillBreakdown.length}</div>
          <div className="text-xs text-muted-foreground">Skills Tracked</div>
        </div>
      </div>

      {/* Skill Breakdown */}
      {data.skillBreakdown.length > 0 && (
        <div>
          <h3 className="mb-3 flex items-center gap-2 font-semibold">
            <BarChart3 className="h-4 w-4" />
            Class Skill Mastery
          </h3>
          <div className="space-y-2">
            {data.skillBreakdown.map((skill) => (
              <div key={skill.id} className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{skill.icon ?? "🎯"}</span>
                    <span className="font-medium">{skill.name}</span>
                    <span className="text-xs text-muted-foreground capitalize">({skill.category})</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <CheckCircle className="h-3 w-3" />
                      {skill.masteredCount}
                    </span>
                    <span className="flex items-center gap-1 text-red-400">
                      <AlertTriangle className="h-3 w-3" />
                      {skill.strugglingCount}
                    </span>
                    <span className="font-semibold">{skill.avgScore}%</span>
                  </div>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${skill.avgScore}%`,
                      backgroundColor: skill.color ?? "#3b82f6",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Student Rankings */}
      {data.studentSummaries?.length > 0 && (
        <div>
          <h3 className="mb-3 flex items-center gap-2 font-semibold">
            <TrendingUp className="h-4 w-4" />
            Student Mastery Rankings
          </h3>
          <div className="space-y-2">
            {data.studentSummaries.slice(0, 10).map((student, i) => (
              <div key={student.id} className="flex items-center gap-3 rounded-lg border p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-bold">
                  {i + 1}
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  {student.avatarUrl ? (
                    <img src={student.avatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-primary">
                      {student.fullName?.charAt(0) ?? "?"}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{student.fullName ?? "Unknown"}</div>
                  <div className="text-xs text-muted-foreground">
                    {student.skillsTracked} skills · {student.masteredSkills} mastered · {student.strugglingSkills} struggling
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{student.avgScore}%</div>
                  <div className="text-xs text-muted-foreground">{student.avgProgress}% progress</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
