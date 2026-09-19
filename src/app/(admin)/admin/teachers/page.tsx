"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, BookOpen, GraduationCap, Trash2 } from "lucide-react";
import { format } from "date-fns";

import { LoadingScreen } from "@/components/ui/loading-screen";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface TeacherRecord {
  id: string;
  email: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  onboardingCompleted: boolean;
  subjects?: string[];
  bio?: string;
  courseCount: number;
  studentCount: number;
  createdAt: string;
}

interface TeachersResponse {
  teachers: TeacherRecord[];
  total: number;
  page: number;
  totalPages: number;
}

export default function AdminTeachersPage() {
  const router = useRouter();
  const [data, setData] = useState<TeachersResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);

    fetch(`/api/admin/teachers?${params}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load teachers");
        return res.json();
      })
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load teachers"))
      .finally(() => setIsLoading(false));
  }, [search, refreshKey]);

  const handleRetry = useCallback(() => {
    setIsLoading(true);
    setRefreshKey((k) => k + 1);
  }, []);

  async function handleDelete(teacherId: string, name: string | null) {
    if (!confirm(`Delete teacher "${name ?? "Unknown"}"? This action cannot be undone.`)) return;

    const res = await fetch(`/api/admin/users/${teacherId}`, { method: "DELETE" });
    if (!res.ok) {
      const err = await res.json();
      alert(err.error ?? "Failed to delete");
      return;
    }

    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        teachers: prev.teachers.filter((t) => t.id !== teacherId),
        total: prev.total - 1,
      };
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Teachers</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage all platform teachers.
          </p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search teachers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.08)]"
        />
      </div>

      {isLoading ? (
        <LoadingScreen fullScreen={false} message="Loading teachers..." />
      ) : error ? (
        <ErrorState message={error} onRetry={handleRetry} />
      ) : data ? (
        <>
          <p className="text-xs text-muted-foreground">
            {data.total} teacher{data.total !== 1 ? "s" : ""}
          </p>

          {data.teachers.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
              No teachers found.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted">
                  <tr>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Teacher</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Subjects</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <BookOpen className="h-3.5 w-3.5" />
                        Courses
                      </span>
                    </th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <GraduationCap className="h-3.5 w-3.5" />
                        Students
                      </span>
                    </th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Joined</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.teachers.map((teacher) => (
                    <tr
                      key={teacher.id}
                      className="group transition-colors hover:bg-muted/50 cursor-pointer"
                      onClick={() => router.push(`/admin/users/${teacher.id}`)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500/10 text-xs font-bold text-primary-400 shrink-0">
                            {teacher.fullName?.charAt(0)?.toUpperCase() ?? teacher.email?.charAt(0)?.toUpperCase() ?? "T"}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {teacher.fullName ?? "Unnamed"}
                            </p>
                            <p className="text-xs text-muted-foreground">{teacher.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {teacher.subjects && teacher.subjects.length > 0 ? (
                            teacher.subjects.slice(0, 3).map((s) => (
                              <Badge key={s} variant="secondary" className="text-xs">
                                {s}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                          {(teacher.subjects?.length ?? 0) > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{teacher.subjects!.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-foreground">{teacher.courseCount}</td>
                      <td className="px-4 py-3 text-foreground">{teacher.studentCount}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {format(new Date(teacher.createdAt), "MMM d, yyyy")}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(teacher.id, teacher.fullName);
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground opacity-0 transition-all hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
