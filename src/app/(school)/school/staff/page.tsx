"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Users, Plus, Search, Mail, Trash2, UserPlus, Upload, Download } from "lucide-react";

import { LoadingScreen } from "@/components/ui/loading-screen";
import { ErrorState } from "@/components/ui/error-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const easing = [0.16, 1, 0.3, 1] as const;

interface StaffMember {
  id: string;
  fullName: string | null;
  email: string | null;
  role: string;
  status: string;
  createdAt: string;
}

export default function SchoolStaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [newStaff, setNewStaff] = useState({ fullName: "", email: "", role: "teacher" });
  const [bulkText, setBulkText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchStaff = useCallback(() => {
    setIsLoading(true);
    fetch("/api/school/staff")
      .then((res) => res.ok ? res.json() : { staff: [] })
      .then((data) => setStaff(data.staff ?? []))
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  async function handleAddStaff() {
    if (!newStaff.email.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/school/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStaff),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error ?? "Failed to add staff member");
        return;
      }

      setNewStaff({ fullName: "", email: "", role: "teacher" });
      setShowAddModal(false);
      fetchStaff();
    } catch {
      alert("Failed to add staff member");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleBulkImport() {
    if (!bulkText.trim()) return;

    setIsSubmitting(true);
    try {
      const lines = bulkText.trim().split("\n");
      const entries = lines.map((line) => {
        const [email, fullName] = line.split(",").map((s) => s.trim());
        return { email, fullName: fullName || "" };
      }).filter((e) => e.email);

      const res = await fetch("/api/school/staff/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries, role: "teacher" }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error ?? "Failed to import staff");
        return;
      }

      const data = await res.json();
      setBulkText("");
      setShowBulkModal(false);
      alert(`Imported ${data.imported} staff members. ${data.skipped} skipped.`);
      fetchStaff();
    } catch {
      alert("Failed to import staff");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRemove(id: string) {
    if (!confirm("Remove this staff member from the school?")) return;

    try {
      const res = await fetch(`/api/school/staff/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error ?? "Failed to remove staff member");
        return;
      }
      fetchStaff();
    } catch {
      alert("Failed to remove staff member");
    }
  }

  const filtered = staff.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.fullName?.toLowerCase().includes(q) ??
      s.email?.toLowerCase().includes(q) ??
      false
    );
  });

  const teachers = filtered.filter((s) => s.role === "teacher");
  const students = filtered.filter((s) => s.role === "student");

  if (isLoading) return <LoadingScreen fullScreen={false} message="Loading staff..." />;
  if (error) return <ErrorState message={error} onRetry={fetchStaff} />;

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
              Staff & Students
            </h1>
            <p className="mt-1 text-muted-foreground">
              Manage teachers and students in your school.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowBulkModal(true)} className="gap-2">
              <Upload className="h-4 w-4" />
              Bulk Import
            </Button>
            <Button onClick={() => setShowAddModal(true)} className="gap-2">
              <UserPlus className="h-4 w-4" />
              Add Staff
            </Button>
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

      <Tabs defaultValue="teachers">
        <TabsList>
          <TabsTrigger value="teachers">
            Teachers ({teachers.length})
          </TabsTrigger>
          <TabsTrigger value="students">
            Students ({students.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="teachers">
          <Card>
            <CardContent className="p-0">
              {teachers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Users className="h-12 w-12 text-muted-foreground/40" />
                  <p className="mt-4 text-muted-foreground">No teachers yet.</p>
                  <Button onClick={() => setShowAddModal(true)} className="mt-4 gap-2">
                    <UserPlus className="h-4 w-4" />
                    Add Teacher
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {teachers.map((teacher) => (
                    <div key={teacher.id} className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500/10 text-sm font-bold text-primary-400">
                          {teacher.fullName?.charAt(0)?.toUpperCase() ?? "T"}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {teacher.fullName ?? "Unnamed"}
                          </p>
                          <p className="text-sm text-muted-foreground">{teacher.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={teacher.status === "active" ? "default" : "secondary"}>
                          {teacher.status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemove(teacher.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students">
          <Card>
            <CardContent className="p-0">
              {students.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Users className="h-12 w-12 text-muted-foreground/40" />
                  <p className="mt-4 text-muted-foreground">No students yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {students.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-500/10 text-sm font-bold text-accent-400">
                          {student.fullName?.charAt(0)?.toUpperCase() ?? "S"}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {student.fullName ?? "Unnamed"}
                          </p>
                          <p className="text-sm text-muted-foreground">{student.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={student.status === "active" ? "default" : "secondary"}>
                          {student.status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemove(student.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Add Staff Member</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Full Name</label>
                <Input
                  value={newStaff.fullName}
                  onChange={(e) => setNewStaff({ ...newStaff, fullName: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email</label>
                <Input
                  type="email"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  placeholder="john@school.edu"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Role</label>
                <select
                  value={newStaff.role}
                  onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                >
                  <option value="teacher">Teacher</option>
                  <option value="student">Student</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddStaff} disabled={isSubmitting || !newStaff.email}>
                  {isSubmitting ? "Adding..." : "Add"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>Bulk Import Staff</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Enter one person per line in the format: <code className="rounded bg-muted px-1">email, full name</code>
              </p>
              <textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder={"john@school.edu, John Doe\njane@school.edu, Jane Smith"}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-mono"
                rows={8}
              />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setShowBulkModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleBulkImport} disabled={isSubmitting || !bulkText.trim()}>
                  {isSubmitting ? "Importing..." : "Import"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
