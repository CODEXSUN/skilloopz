"use client";

import { useState } from "react";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { OfflineBanner } from "@/components/layout/offline-banner";

type Role = "student" | "teacher" | "parent" | "admin" | "school";

interface ShellProps {
  role: Role;
  children: React.ReactNode;
}

export function Shell({ role, children }: ShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        role={role}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <MobileNav
        role={role}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex flex-1 flex-col">
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-6">{children}</main>
        <OfflineBanner />
      </div>
    </div>
  );
}
