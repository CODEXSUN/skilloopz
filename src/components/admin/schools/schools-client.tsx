"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Building2, Search, Users, BookOpen, Calendar, DollarSign } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const easing = [0.16, 1, 0.3, 1] as const;

interface SchoolRecord {
  id: string;
  name: string;
  code: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  country: string | null;
  tier: string;
  status: string;
  maxStudents: number;
  currentStudents: number;
  contractStart: string | null;
  contractEnd: string | null;
  createdAt: string;
  teacherCount: number;
  studentCount: number;
  courseCount: number;
}

interface AdminSchoolsClientProps {
  schools: SchoolRecord[];
}

export function AdminSchoolsClient({ schools }: AdminSchoolsClientProps) {
  const [search, setSearch] = useState("");

  const filtered = schools.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.code.toLowerCase().includes(q) ||
      s.city?.toLowerCase().includes(q) ||
      s.country?.toLowerCase().includes(q)
    );
  });

  const tierLabels: Record<string, string> = {
    free: "Free",
    pro: "Pro",
    school: "School",
    enterprise: "Enterprise",
  };

  const tierColors: Record<string, string> = {
    free: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    pro: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    school: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    enterprise: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  };

  const statusColors: Record<string, string> = {
    active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    inactive: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    suspended: "bg-red-500/20 text-red-400 border-red-500/30",
  };

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
              Schools
            </h1>
            <p className="mt-1 text-muted-foreground">
              Manage school accounts and contracts.
            </p>
          </div>
        </div>
      </motion.div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, code, city, or country..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((school) => (
          <Card key={school.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium text-foreground truncate">{school.name}</p>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {school.code} &middot; {school.city ?? "No city"}, {school.country}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Badge className={tierColors[school.tier] ?? "bg-muted text-muted-foreground"}>
                    {tierLabels[school.tier] ?? school.tier}
                  </Badge>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="rounded-lg bg-[rgba(255,255,255,0.03)] p-2 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Users className="h-3 w-3 text-primary-400" />
                    <p className="font-heading text-sm font-bold text-foreground">{school.studentCount}</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Students</p>
                </div>
                <div className="rounded-lg bg-[rgba(255,255,255,0.03)] p-2 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Users className="h-3 w-3 text-green-400" />
                    <p className="font-heading text-sm font-bold text-foreground">{school.teacherCount}</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Teachers</p>
                </div>
                <div className="rounded-lg bg-[rgba(255,255,255,0.03)] p-2 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <BookOpen className="h-3 w-3 text-purple-400" />
                    <p className="font-heading text-sm font-bold text-foreground">{school.courseCount}</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Courses</p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <Badge className={statusColors[school.status] ?? "bg-muted text-muted-foreground"}>
                  {school.status}
                </Badge>
                {school.contractEnd && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    Ends {new Date(school.contractEnd).toLocaleDateString()}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground/40" />
            <p className="mt-4 text-muted-foreground">No schools found.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
