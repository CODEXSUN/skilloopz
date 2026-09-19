"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  X, LayoutDashboard, BookOpen, Award, Trophy, Users, BarChart3, Eye, Settings,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useNavigation } from "@/hooks/useNavigation";
import type { NavItemData } from "@/lib/navigation-service";

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  BookOpen,
  Award,
  Trophy,
  Users,
  BarChart3,
  Eye,
  Settings,
};

interface MobileNavProps {
  role: string;
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ role, isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname();
  const { items, isLoading } = useNavigation(role);

  if (!isOpen) return null;

  function renderItems(items: NavItemData[], depth = 0): React.ReactNode {
    return (
      <ul className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon ? iconMap[item.icon] : null;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const hasChildren = item.children.length > 0;
          return (
            <li key={item.id}>
              <Link
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  depth > 0 && "pl-8",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {Icon && <Icon className="h-5 w-5 shrink-0" />}
                {item.label}
              </Link>
              {hasChildren && renderItems(item.children, depth + 1)}
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-card shadow-xl">
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <span className="text-lg font-bold text-card-foreground">NEOT</span>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground border-t-primary" />
            </div>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No navigation items</p>
          ) : (
            renderItems(items)
          )}
        </nav>
      </div>
    </div>
  );
}
