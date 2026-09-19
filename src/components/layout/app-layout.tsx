"use client";

import { Shell } from "@/components/layout/shell";

type Role = "student" | "teacher" | "parent" | "admin" | "school";

interface AppLayoutProps {
  role: Role;
  children: React.ReactNode;
}

export function AppLayout({ role, children }: AppLayoutProps) {
  return <Shell role={role}>{children}</Shell>;
}
