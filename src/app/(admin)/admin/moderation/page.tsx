"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { FileText, BookOpen, Users, GraduationCap, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { ErrorState } from "@/components/ui/error-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TABS = [
  { id: "reports", label: "Reports", icon: FileText },
  { id: "courses", label: "Courses", icon: BookOpen },
  { id: "users", label: "Users", icon: Users },
  { id: "teachers", label: "Teachers", icon: GraduationCap },
] as const;

/* ── Reports Tab ── */

interface Reporter {
  email: string | null;
  fullName: string | null;
}

interface ReportRecord {
  id: string;
  type: string;
  targetId: string;
  reason: string;
  reportedBy: string;
  status: string;
  createdAt: string;
  reporter: Reporter | null;
}

function ReportsTab() {
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams();
    if (statusFilter && statusFilter !== "all") params.set("status", statusFilter);

    fetch(`/api/admin/moderation?${params}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load reports");
        return res.json();
      })
      .then((data) => setReports(data.reports))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load reports"))
      .finally(() => setIsLoading(false));
  }, [statusFilter, refreshKey]);

  async function handleStatusChange(id: string, newStatus: string) {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/admin/moderation", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)));
      }
    } catch {
      // ignore
    } finally {
      setUpdatingId(null);
    }
  }

  if (isLoading) return <LoadingScreen fullScreen={false} message="Loading reports..." />;
  if (error) return <ErrorState message={error} onRetry={() => { setIsLoading(true); setRefreshKey((k) => k + 1); }} />;

  const statusBadge: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    pending: "secondary",
    resolved: "default",
    dismissed: "outline",
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="report-status" className="text-xs">Status</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger id="report-status" className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="dismissed">Dismissed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <FileText className="mx-auto mb-3 h-8 w-8 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No reports found</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted">
              <tr>
                <th className="px-4 py-3 font-medium text-muted-foreground">Type</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Target ID</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Reason</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Reported By</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Date</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {reports.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3"><Badge variant="outline">{r.type}</Badge></td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{r.targetId}</td>
                  <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate">{r.reason}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{r.reporter?.fullName || "Unknown"}</p>
                    {r.reporter?.email && <p className="text-xs text-tertiary-foreground">{r.reporter.email}</p>}
                  </td>
                  <td className="px-4 py-3"><Badge variant={statusBadge[r.status] ?? "outline"}>{r.status}</Badge></td>
                  <td className="px-4 py-3 text-muted-foreground">{format(new Date(r.createdAt), "MMM d, yyyy")}</td>
                  <td className="px-4 py-3">
                    {r.status === "pending" ? (
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="text-green-500 hover:text-green-600" disabled={updatingId === r.id} onClick={() => handleStatusChange(r.id, "resolved")}>Resolve</Button>
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" disabled={updatingId === r.id} onClick={() => handleStatusChange(r.id, "dismissed")}>Dismiss</Button>
                      </div>
                    ) : <span className="text-xs text-tertiary-foreground">—</span>}
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

/* ── Courses Tab ── */

interface CourseItem {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  deletedAt: string | null;
  teacher: { fullName: string | null; email: string | null };
  category: { name: string } | null;
  _count: { enrollments: number; modules: number };
}

function CoursesTab() {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);
    params.set("page", String(page));

    fetch(`/api/admin/moderation/courses?${params}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load courses");
        return res.json();
      })
      .then((data) => {
        setCourses(data.courses);
        setTotalPages(data.totalPages);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load courses"))
      .finally(() => setIsLoading(false));
  }, [statusFilter, page, refreshKey]);

  async function handleAction(courseId: string, action: string) {
    setActionLoading(courseId);
    try {
      const res = await fetch("/api/admin/moderation/courses", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, action }),
      });
      if (res.ok) setRefreshKey((k) => k + 1);
    } catch {
      // ignore
    } finally {
      setActionLoading(null);
    }
  }

  if (isLoading) return <LoadingScreen fullScreen={false} message="Loading courses..." />;
  if (error) return <ErrorState message={error} onRetry={() => { setIsLoading(true); setRefreshKey((k) => k + 1); }} />;

  const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    published: "default",
    draft: "secondary",
    archived: "outline",
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="course-status" className="text-xs">Status</Label>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger id="course-status" className="w-36">
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

      {courses.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <BookOpen className="mx-auto mb-3 h-8 w-8 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No courses found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {courses.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-xl border bg-card p-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-foreground truncate">{c.title}</h3>
                  <Badge variant={statusVariant[c.status] ?? "secondary"}>{c.status}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  by {c.teacher.fullName || "Unknown"} · {c._count.modules} modules · {c._count.enrollments} enrollments
                  {c.category && <span> · {c.category.name}</span>}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                {c.status === "draft" && (
                  <Button variant="ghost" size="sm" disabled={actionLoading === c.id} onClick={() => handleAction(c.id, "approve")}>
                    {actionLoading === c.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Approve"}
                  </Button>
                )}
                {c.status === "published" && (
                  <Button variant="ghost" size="sm" disabled={actionLoading === c.id} onClick={() => handleAction(c.id, "archive")}>
                    {actionLoading === c.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Archive"}
                  </Button>
                )}
                {c.status === "archived" && (
                  <Button variant="ghost" size="sm" disabled={actionLoading === c.id} onClick={() => handleAction(c.id, "restore")}>
                    {actionLoading === c.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Restore"}
                  </Button>
                )}
              </div>
            </div>
          ))}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <span className="text-xs text-muted-foreground">Page {page} of {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Users Tab ── */

interface UserItem {
  id: string;
  email: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  role: string;
  status: string;
  xp: number;
  level: number;
  currentStreak: number;
  createdAt: string;
  _count: { enrollments: number; courses: number };
}

function UsersTab() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams();
    if (roleFilter !== "all") params.set("role", roleFilter);
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (search) params.set("search", search);
    params.set("page", String(page));

    const timer = setTimeout(() => {
      fetch(`/api/admin/moderation/users?${params}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to load users");
          return res.json();
        })
        .then((data) => {
          setUsers(data.users);
          setTotalPages(data.totalPages);
        })
        .catch((err) => setError(err instanceof Error ? err.message : "Failed to load users"))
        .finally(() => setIsLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [roleFilter, statusFilter, search, page, refreshKey]);

  async function handleAction(userId: string, action: string) {
    setActionLoading(userId);
    try {
      const res = await fetch("/api/admin/moderation/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action }),
      });
      if (res.ok) setRefreshKey((k) => k + 1);
    } catch {
      // ignore
    } finally {
      setActionLoading(null);
    }
  }

  if (isLoading) return <LoadingScreen fullScreen={false} message="Loading users..." />;
  if (error) return <ErrorState message={error} onRetry={() => { setIsLoading(true); setRefreshKey((k) => k + 1); }} />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="user-search" className="text-xs">Search</Label>
          <Input id="user-search" placeholder="Name or email..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="w-48" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="user-role" className="text-xs">Role</Label>
          <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setPage(1); }}>
            <SelectTrigger id="user-role" className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="teacher">Teacher</SelectItem>
              <SelectItem value="parent">Parent</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="user-status" className="text-xs">Status</Label>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger id="user-status" className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="banned">Banned</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <Users className="mx-auto mb-3 h-8 w-8 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No users found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((u) => (
            <div key={u.id} className="flex items-center justify-between rounded-xl border bg-card p-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium text-foreground">
                  {u.fullName?.charAt(0).toUpperCase() || u.email?.charAt(0).toUpperCase() || "?"}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-foreground truncate">{u.fullName || "Unnamed"}</h3>
                    <Badge variant={u.status === "banned" ? "destructive" : "secondary"}>{u.status}</Badge>
                    <Badge variant="outline">{u.role}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                {u.status === "banned" ? (
                  <Button variant="ghost" size="sm" disabled={actionLoading === u.id} onClick={() => handleAction(u.id, "unban")}>
                    {actionLoading === u.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Unban"}
                  </Button>
                ) : (
                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600" disabled={actionLoading === u.id} onClick={() => handleAction(u.id, "ban")}>
                    {actionLoading === u.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ban"}
                  </Button>
                )}
              </div>
            </div>
          ))}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <span className="text-xs text-muted-foreground">Page {page} of {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Teachers Tab ── */

function TeachersTab() {
  const [teachers, setTeachers] = useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("role", "teacher");
    params.set("page", String(page));

    fetch(`/api/admin/moderation/users?${params}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load teachers");
        return res.json();
      })
      .then((data) => {
        setTeachers(data.users);
        setTotalPages(data.totalPages);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load teachers"))
      .finally(() => setIsLoading(false));
  }, [page, refreshKey]);

  async function handleAction(userId: string, action: string) {
    setActionLoading(userId);
    try {
      const res = await fetch("/api/admin/moderation/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action }),
      });
      if (res.ok) setRefreshKey((k) => k + 1);
    } catch {
      // ignore
    } finally {
      setActionLoading(null);
    }
  }

  if (isLoading) return <LoadingScreen fullScreen={false} message="Loading teachers..." />;
  if (error) return <ErrorState message={error} onRetry={() => { setIsLoading(true); setRefreshKey((k) => k + 1); }} />;

  return (
    <div className="space-y-4">
      {teachers.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <GraduationCap className="mx-auto mb-3 h-8 w-8 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No teachers found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {teachers.map((t) => (
            <div key={t.id} className="flex items-center justify-between rounded-xl border bg-card p-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium text-foreground">
                  {t.fullName?.charAt(0).toUpperCase() || "?"}
                </div>
                <div className="min-w-0">
                  <h3 className="font-medium text-foreground truncate">{t.fullName || "Unnamed"}</h3>
                  <p className="text-xs text-muted-foreground truncate">{t.email} · {t._count.courses} courses · {t._count.enrollments} enrollments</p>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                {t.status === "banned" ? (
                  <Button variant="ghost" size="sm" disabled={actionLoading === t.id} onClick={() => handleAction(t.id, "unban")}>Unban</Button>
                ) : (
                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600" disabled={actionLoading === t.id} onClick={() => handleAction(t.id, "ban")}>Ban</Button>
                )}
              </div>
            </div>
          ))}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <span className="text-xs text-muted-foreground">Page {page} of {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Main Page ── */

export default function AdminModerationPage() {
  const [activeTab, setActiveTab] = useState<string>("reports");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Moderation</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review reports, manage courses, and moderate users
        </p>
      </div>

      <div className="flex gap-1 rounded-xl border bg-muted/30 p-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {activeTab === "reports" && <ReportsTab />}
      {activeTab === "courses" && <CoursesTab />}
      {activeTab === "users" && <UsersTab />}
      {activeTab === "teachers" && <TeachersTab />}
    </div>
  );
}
