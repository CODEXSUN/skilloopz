"use client";

import Link from "next/link";
import { PlusCircle, Users, BarChart3 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const actions = [
  {
    label: "Create New Course",
    href: "/teacher/courses/new",
    icon: PlusCircle,
    color: "text-primary-600 bg-primary-100",
  },
  {
    label: "View Students",
    href: "/teacher/students",
    icon: Users,
    color: "text-green-600 bg-green-100",
  },
  {
    label: "View Analytics",
    href: "/teacher/analytics",
    icon: BarChart3,
    color: "text-purple-600 bg-purple-100",
  },
];

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-3">
          {actions.map(({ label, href, icon: Icon, color }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-2 rounded-lg border border-border p-4 transition-colors hover:border-border hover:bg-muted",
              )}
            >
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", color)}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium text-foreground">{label}</span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
