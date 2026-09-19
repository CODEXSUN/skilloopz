"use client";

import { Menu, LogOut, User, GraduationCap, Users, HeartHandshake, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { SearchInput } from "@/components/search/search-input";
import { OfflineControls } from "@/components/layout/offline-controls";
import { useAuth } from "@/hooks/useAuth";

const ROLE_OPTIONS = [
  { value: "student", label: "Student", icon: GraduationCap },
  { value: "teacher", label: "Teacher", icon: Users },
  { value: "parent", label: "Parent", icon: HeartHandshake },
];

const DASHBOARD_MAP: Record<string, string> = {
  student: "/dashboard",
  teacher: "/teacher",
  parent: "/parent",
};

interface HeaderProps {
  onMenuToggle: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [switchingRole, setSwitchingRole] = useState<string | null>(null);

  async function switchRole(role: string) {
    if (!user || role === user.role) return;
    setSwitchingRole(role);
    try {
      const res = await fetch("/api/auth/role", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error("Failed to switch role");
      router.push(DASHBOARD_MAP[role] ?? "/dashboard");
    } catch {
      alert("Failed to switch role");
    } finally {
      setSwitchingRole(null);
    }
  }

  const CurrentRoleIcon = ROLE_OPTIONS.find((r) => r.value === user?.role)?.icon;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/95 px-4 backdrop-blur lg:px-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={onMenuToggle}
        className="lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex-1" />

      <SearchInput />
      <NotificationBell />
      <ThemeToggle />
      <OfflineControls />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500">
            <Avatar size="sm">
              <AvatarImage src={user?.avatarUrl ?? undefined} alt="" />
              <AvatarFallback>{user?.email?.charAt(0).toUpperCase() ?? "U"}</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <div className="px-2 py-1.5">
            <p className="truncate text-sm font-medium text-foreground">
              {user?.email}
            </p>
          </div>
          <DropdownMenuSeparator />
          <div className="border-b border-border px-2 py-1.5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1 px-1">
              {CurrentRoleIcon && <CurrentRoleIcon className="h-3 w-3" />}
              <span className="capitalize font-medium">{user?.role}</span>
            </div>
            <div className="space-y-0.5">
              {ROLE_OPTIONS.filter((r) => r.value !== user?.role).map((role) => {
                const Icon = role.icon;
                return (
                  <button
                    key={role.value}
                    onClick={() => switchRole(role.value)}
                    disabled={switchingRole === role.value}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1 text-xs text-muted-foreground hover:bg-glass hover:text-foreground transition-colors disabled:opacity-50"
                  >
                    {switchingRole === role.value ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Icon className="h-3 w-3" />
                    )}
                    <span>Switch to {role.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
            <User className="h-4 w-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={logout}>
            <LogOut className="h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
