"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Users, Search, Trophy, BookOpen } from "lucide-react";

import { LoadingScreen } from "@/components/ui/loading-screen";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const easing = [0.16, 1, 0.3, 1] as const;

interface StudentData {
  id: string;
  fullName: string | null;
  email: string | null;
  xp: number;
  level: number;
  currentStreak: number;
  enrolledCourses: number;
  completedLessons: number;
  status: string;
}

export default function SchoolStudentsPage() {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchStudents = useCallback(() => {
    setIsLoading(true);
    fetch("/api/school/students")
      .then((res) => res.ok ? res.json() : { students: [] })
      .then((data) => setStudents(data.students ?? []))
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const filtered = students.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.fullName?.toLowerCase().includes(q) ??
      s.email?.toLowerCase().includes(q) ??
      false
    );
  });

  if (isLoading) return <LoadingScreen fullScreen={false} message="Loading students..." />;
  if (error) return <ErrorState message={error} onRetry={fetchStudents} />;

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easing }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
              Students
            </h1>
            <p className="mt-1 text-muted-foreground">
              View all students enrolled in your school.
            </p>
          </div>
        </div>
      </motion.div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground/40" />
            <p className="mt-4 text-muted-foreground">No students found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((student) => (
            <Card key={student.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-500/10 text-sm font-bold text-accent-400">
                    {student.fullName?.charAt(0)?.toUpperCase() ?? "S"}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {student.fullName ?? "Unnamed"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{student.email}</p>
                  </div>
                  <Badge variant={student.status === "active" ? "default" : "secondary"} className="shrink-0">
                    {student.status}
                  </Badge>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="rounded-lg bg-[rgba(255,255,255,0.03)] p-2 text-center">
                    <p className="text-[10px] text-muted-foreground">Level</p>
                    <p className="font-heading text-lg font-bold text-foreground">{student.level}</p>
                  </div>
                  <div className="rounded-lg bg-[rgba(255,255,255,0.03)] p-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Trophy className="h-3 w-3 text-yellow-400" />
                      <p className="font-heading text-lg font-bold text-foreground">{student.xp}</p>
                    </div>
                    <p className="text-[10px] text-muted-foreground">XP</p>
                  </div>
                  <div className="rounded-lg bg-[rgba(255,255,255,0.03)] p-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <BookOpen className="h-3 w-3 text-primary-400" />
                      <p className="font-heading text-lg font-bold text-foreground">{student.enrolledCourses}</p>
                    </div>
                    <p className="text-[10px] text-muted-foreground">Courses</p>
                  </div>
                </div>

                {student.currentStreak > 0 && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Streak: {student.currentStreak} day{student.currentStreak !== 1 ? "s" : ""}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
