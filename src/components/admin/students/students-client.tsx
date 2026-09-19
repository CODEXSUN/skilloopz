"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { format } from "date-fns";

import { Input } from "@/components/ui/input";

interface StudentRecord {
  id: string;
  email: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  xp: number;
  level: number;
  currentStreak: number;
  createdAt: string;
  enrolledCourses: number;
  parentName: string | null;
}

interface AdminStudentsClientProps {
  students: StudentRecord[];
}

export function AdminStudentsClient({ students }: AdminStudentsClientProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return students;
    const q = search.toLowerCase();
    return students.filter(
      (s) =>
        s.fullName?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q),
    );
  }, [students, search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Students</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage all platform students.
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search students..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.08)]"
        />
      </div>

      <p className="text-xs text-muted-foreground">
        {filtered.length} student{filtered.length !== 1 ? "s" : ""}
      </p>

      {filtered.length === 0 ? (
        <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
          No students found.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted">
              <tr>
                <th className="px-4 py-3 font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Email</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Enrolled Courses</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">XP</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Level</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Streak</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((student) => (
                <tr key={student.id} className="group transition-colors hover:bg-muted/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500/10 text-xs font-bold text-primary-400 shrink-0">
                        {student.fullName?.charAt(0)?.toUpperCase() ?? student.email?.charAt(0)?.toUpperCase() ?? "S"}
                      </div>
                      <span className="font-medium text-foreground">
                        {student.fullName ?? "Unnamed"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{student.email ?? "—"}</td>
                  <td className="px-4 py-3 text-foreground">{student.enrolledCourses}</td>
                  <td className="px-4 py-3 text-foreground">{student.xp}</td>
                  <td className="px-4 py-3 text-foreground">{student.level}</td>
                  <td className="px-4 py-3 text-foreground">{student.currentStreak}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {format(new Date(student.createdAt), "MMM d, yyyy")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
