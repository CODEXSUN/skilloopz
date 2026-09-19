"use client";

import { BookOpen, Users, GraduationCap, TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface OverviewStatsProps {
  stats: {
    totalCourses: number;
    totalStudents: number;
    totalEnrollments: number;
    averageProgress: number;
  };
}

const statCards = [
  {
    label: "Total Courses",
    value: "totalCourses",
    icon: BookOpen,
    color: "text-blue-600 bg-blue-100",
    format: (v: number) => v.toString(),
  },
  {
    label: "Total Students",
    value: "totalStudents",
    icon: Users,
    color: "text-green-600 bg-green-100",
    format: (v: number) => v.toString(),
  },
  {
    label: "Enrollments",
    value: "totalEnrollments",
    icon: GraduationCap,
    color: "text-purple-600 bg-purple-100",
    format: (v: number) => v.toString(),
  },
  {
    label: "Average Progress",
    value: "averageProgress",
    icon: TrendingUp,
    color: "text-amber-600 bg-amber-100",
    format: (v: number) => `${Math.round(v)}%`,
  },
];

export function OverviewStats({ stats }: OverviewStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map(({ label, value, icon: Icon, color, format }) => (
        <Card key={value}>
          <CardContent className="flex items-center gap-3">
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", color)}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {format(stats[value as keyof typeof stats])}
              </p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
