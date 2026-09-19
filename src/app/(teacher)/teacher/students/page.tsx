"use client";

import { useCallback, useEffect, useState } from "react";
import { Search, Users, ArrowUpDown, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { ErrorState } from "@/components/ui/error-state";

interface Student {
  id: string;
  fullName: string | null;
  email: string | null;
  avatarUrl: string | null;
  courseCount: number;
  lastActivity: string | null;
  avgScore: number | null;
}

interface StudentsResponse {
  students: Student[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function StudentsPage() {
  const [data, setData] = useState<StudentsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("name");
  const [order, setOrder] = useState("asc");
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams({ q: query, sort, order, page: String(page), limit: "10" });
    fetch(`/api/teacher/students?${params}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [query, sort, order, page, refreshKey]);

  const handleRetry = useCallback(() => {
    setLoading(true);
    setError(false);
    setRefreshKey((k) => k + 1);
  }, []);

  const toggleSort = (field: string) => {
    if (sort === field) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setSort(field);
      setOrder("desc");
    }
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Students</h1>
        <p className="mt-1 text-sm text-muted-foreground">View and manage your enrolled students.</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-tertiary-foreground" />
          <Input
            placeholder="Search by name or email..."
            className="pl-10"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
          />
        </div>
        <button
          onClick={handleRetry}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {loading ? (
        <LoadingSkeleton variant="list" count={5} />
      ) : error ? (
        <ErrorState message="Failed to load students. Please try again." />
      ) : !data || data.students.length === 0 ? (
        <Card>
          <CardHeader className="flex flex-col items-center py-12 text-center">
            <Users className="mb-3 h-12 w-12 text-tertiary-foreground" />
            <CardTitle>{query ? "No matching students" : "No students yet"}</CardTitle>
            <CardDescription>
              {query ? "Try a different search term." : "Students will appear here once they enroll in your courses."}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <>
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    <button onClick={() => toggleSort("name")} className="flex items-center gap-1 hover:text-foreground">
                      Name <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    <button onClick={() => toggleSort("courses")} className="flex items-center gap-1 hover:text-foreground">
                      Courses <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    <button onClick={() => toggleSort("activity")} className="flex items-center gap-1 hover:text-foreground">
                      Last Activity <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    <button onClick={() => toggleSort("score")} className="flex items-center gap-1 hover:text-foreground">
                      Avg Score <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.students.map((student) => (
                  <tr key={student.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium text-foreground">
                      {student.fullName ?? student.email ?? "Unknown"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{student.email ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{student.courseCount}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {student.lastActivity ? new Date(student.lastActivity).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {student.avgScore != null ? `${student.avgScore}%` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(data.page - 1) * data.limit + 1}–{Math.min(data.page * data.limit, data.total)} of {data.total}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                  className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= data.totalPages}
                  className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
