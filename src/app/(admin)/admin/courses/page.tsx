"use client";

import { useState, useEffect } from "react";
import { Search, Trash2, Eye, EyeOff, Archive, Users, Layers } from "lucide-react";
import { format } from "date-fns";

import { LoadingScreen } from "@/components/ui/loading-screen";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface CourseRecord {
  id: string;
  title: string;
  description: string | null;
  status: string;
  difficulty: string;
  createdAt: string;
  teacher: {
    id: string;
    fullName: string | null;
    avatarUrl: string | null;
  };
  category: { id: string; name: string } | null;
  _count: {
    enrollments: number;
    modules: number;
  };
}

interface CoursesResponse {
  courses: CourseRecord[];
  total: number;
  page: number;
  totalPages: number;
}

const statusBadge: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  published: "default",
  draft: "secondary",
  archived: "outline",
};

export default function AdminCoursesPage() {
  const [data, setData] = useState<CoursesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const refetch = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status && status !== "all") params.set("status", status);
    const url = `/api/admin/courses?${params}`;
    setIsLoading(true);
    fetch(url)
      .then((res) => { if (!res.ok) throw new Error("Failed to load courses"); return res.json(); })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status && status !== "all") params.set("status", status);
    const url = `/api/admin/courses?${params}`;
    const controller = new AbortController();
    fetch(url, { signal: controller.signal })
      .then((res) => { if (!res.ok) throw new Error("Failed to load courses"); return res.json(); })
      .then(setData)
      .catch((err) => { if (err.name !== "AbortError") setError(err.message); })
      .finally(() => setIsLoading(false));
    return () => controller.abort();
  }, [search, status]);

  async function changeStatus(courseId: string, newStatus: string) {
    const res = await fetch(`/api/admin/courses/${courseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.error ?? "Failed to update course");
      return;
    }

    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        courses: prev.courses.map((c) =>
          c.id === courseId ? { ...c, status: newStatus } : c,
        ),
      };
    });
  }

  async function handleDelete(courseId: string, title: string) {
    if (!confirm(`Delete course "${title}"? This cannot be undone.`)) return;

    const res = await fetch(`/api/admin/courses/${courseId}`, { method: "DELETE" });
    if (!res.ok) {
      const err = await res.json();
      alert(err.error ?? "Failed to delete");
      return;
    }

    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        courses: prev.courses.filter((c) => c.id !== courseId),
        total: prev.total - 1,
      };
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Courses</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage all courses across the platform.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="search" className="text-xs">Search</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Course or teacher..."
              className="w-60 pl-8 bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.08)]"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="status" className="text-xs">Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger id="status" className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <LoadingScreen fullScreen={false} message="Loading courses..." />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : data ? (
        <>
          <p className="text-xs text-muted-foreground">
            {data.total} course{data.total !== 1 ? "s" : ""}
          </p>

          {data.courses.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
              No courses found.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted">
                  <tr>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Course</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Teacher</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        Enrolled
                      </span>
                    </th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Layers className="h-3.5 w-3.5" />
                        Modules
                      </span>
                    </th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Created</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.courses.map((course) => (
                    <tr
                      key={course.id}
                      className="group transition-colors hover:bg-muted/50"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{course.title}</p>
                        {course.category && (
                          <p className="text-xs text-muted-foreground">{course.category.name}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-500/10 text-[10px] font-bold text-primary-400">
                            {course.teacher.fullName?.charAt(0)?.toUpperCase() ?? "T"}
                          </div>
                          <span className="text-foreground">{course.teacher.fullName ?? "Unknown"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={statusBadge[course.status] ?? "outline"}>
                          {course.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-foreground">{course._count.enrollments}</td>
                      <td className="px-4 py-3 text-foreground">{course._count.modules}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {format(new Date(course.createdAt), "MMM d, yyyy")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          {course.status !== "published" && (
                            <button
                              onClick={() => changeStatus(course.id, "published")}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-green-500/10 hover:text-green-400"
                              title="Publish"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          )}
                          {course.status === "published" && (
                            <button
                              onClick={() => changeStatus(course.id, "draft")}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-yellow-500/10 hover:text-yellow-400"
                              title="Unpublish"
                            >
                              <EyeOff className="h-4 w-4" />
                            </button>
                          )}
                          {course.status !== "archived" && (
                            <button
                              onClick={() => changeStatus(course.id, "archived")}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-orange-500/10 hover:text-orange-400"
                              title="Archive"
                            >
                              <Archive className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(course.id, course.title)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-red-500/10 hover:text-red-400"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
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
