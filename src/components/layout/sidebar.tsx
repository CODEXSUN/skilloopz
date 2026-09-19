"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Award,
  Trophy,
  Target,
  Users,
  BarChart3,
  Eye,
  Settings,
  FileText,
  Palette,
  Puzzle,
  GraduationCap,
  Database,
  History,
  UserCheck,
  Heart,
  LayoutTemplate,
  Navigation,
  Globe,
  Bell,
  Shield,
  Box,
  Zap,
  Languages,
  Plug,
  Code,
  Accessibility,
  Layers,
  Webhook,
  Bookmark,
  Building2,
  ShoppingCart,
  DollarSign,
  Earth,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useNavigation } from "@/hooks/useNavigation";
import type { NavItemData } from "@/lib/navigation-service";

type Role = "student" | "teacher" | "parent" | "admin" | "school";

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  BookOpen,
  Award,
  Trophy,
  Target,
  Users,
  BarChart3,
  Eye,
  Settings,
  FileText,
  Palette,
  Puzzle,
  GraduationCap,
  Database,
  History,
  UserCheck,
  Heart,
  LayoutTemplate,
  Navigation,
  Globe,
  Bell,
  Shield,
  Box,
  Zap,
  Languages,
  Plug,
  Code,
  Accessibility,
  Layers,
  Webhook,
  Bookmark,
  Building2,
  ShoppingCart,
  DollarSign,
  Earth,
};

const fallbackNavItems: Record<Role, NavItemData[]> = {
  student: [
    { id: "student-home", label: "Home", href: "/dashboard", icon: "LayoutDashboard", children: [] },
    { id: "student-worlds", label: "Learning Worlds", href: "/worlds", icon: "Earth", children: [] },
    { id: "student-courses", label: "My Courses", href: "/dashboard/courses", icon: "BookOpen", children: [] },
    { id: "student-bookmarks", label: "Bookmarks", href: "/dashboard/bookmarks", icon: "Bookmark", children: [] },
    { id: "student-notes", label: "Notes", href: "/dashboard/notes", icon: "FileText", children: [] },
    { id: "student-achievements", label: "Achievements", href: "/dashboard/achievements", icon: "Award", children: [] },
    { id: "student-mastery", label: "Mastery", href: "/dashboard/mastery", icon: "Target", children: [] },
    { id: "student-leaderboard", label: "Leaderboard", href: "/dashboard/leaderboard", icon: "Trophy", children: [] },
    { id: "student-marketplace", label: "Marketplace", href: "/marketplace", icon: "ShoppingCart", children: [] },
    { id: "student-settings", label: "Settings", href: "/dashboard/settings", icon: "Settings", children: [] },
  ],
  teacher: [
    { id: "teacher-dashboard", label: "Dashboard", href: "/teacher", icon: "LayoutDashboard", children: [] },
    { id: "teacher-courses", label: "My Courses", href: "/teacher/courses", icon: "BookOpen", children: [] },
    { id: "teacher-question-bank", label: "Question Bank", href: "/teacher/question-bank", icon: "Database", children: [] },
    { id: "teacher-analytics", label: "Analytics", href: "/teacher/analytics", icon: "BarChart3", children: [] },
    { id: "teacher-earnings", label: "Earnings", href: "/teacher/earnings", icon: "DollarSign", children: [] },
    { id: "teacher-students", label: "Students", href: "/teacher/students", icon: "Users", children: [] },
    { id: "teacher-settings", label: "Settings", href: "/dashboard/settings", icon: "Settings", children: [] },
  ],
  parent: [
    { id: "parent-overview", label: "Overview", href: "/parent", icon: "Eye", children: [] },
    { id: "parent-children", label: "Children", href: "/parent/children", icon: "Users", children: [] },
    { id: "parent-home-learning", label: "Home Learning", href: "/parent/home-learning", icon: "BookOpen", children: [] },
    { id: "parent-reports", label: "Reports", href: "/parent/reports", icon: "BarChart3", children: [] },
    { id: "parent-messages", label: "Messages", href: "/parent/messages", icon: "Mail", children: [] },
    { id: "parent-settings", label: "Settings", href: "/dashboard/settings", icon: "Settings", children: [] },
  ],
  admin: [
    { id: "admin-dashboard", label: "Dashboard", href: "/admin", icon: "LayoutDashboard", children: [] },
    { id: "admin-analytics", label: "Analytics", href: "/admin/analytics", icon: "BarChart3", children: [] },
    { id: "admin-users", label: "Users", href: "/admin/users", icon: "Users", children: [] },
    { id: "admin-roles", label: "Roles", href: "/admin/roles", icon: "Shield", children: [] },
    { id: "admin-teachers", label: "Teachers", href: "/admin/teachers", icon: "GraduationCap", children: [] },
    { id: "admin-students", label: "Students", href: "/admin/students", icon: "UserCheck", children: [] },
    { id: "admin-parents", label: "Parents", href: "/admin/parents", icon: "Heart", children: [] },
    { id: "admin-schools", label: "Schools", href: "/admin/schools", icon: "Building2", children: [] },
    { id: "admin-tenants", label: "Tenants", href: "/admin/tenants", icon: "Globe", children: [] },
    { id: "admin-courses", label: "Courses", href: "/admin/courses", icon: "BookOpen", children: [] },
    { id: "admin-pages", label: "Pages", href: "/admin/pages", icon: "FileText", children: [] },
    { id: "admin-templates", label: "Templates", href: "/admin/templates", icon: "LayoutTemplate", children: [] },
    { id: "admin-data-binding", label: "Data Binding", href: "/admin/data-binding", icon: "Database", children: [] },
    { id: "admin-navigation", label: "Navigation", href: "/admin/navigation", icon: "Navigation", children: [] },
    { id: "admin-themes", label: "Themes", href: "/admin/themes", icon: "Palette", children: [] },
    { id: "admin-blocks", label: "Blocks", href: "/admin/blocks", icon: "Puzzle", children: [] },
    { id: "admin-seo", label: "SEO", href: "/admin/seo", icon: "Globe", children: [] },
    { id: "admin-revenue", label: "Revenue", href: "/admin/revenue", icon: "DollarSign", children: [] },
    { id: "admin-notifications", label: "Notifications", href: "/admin/notifications", icon: "Bell", children: [] },
    { id: "admin-security", label: "Security", href: "/admin/security", icon: "Shield", children: [] },
    { id: "admin-backup", label: "Backup", href: "/admin/backup", icon: "Database", children: [] },
    { id: "admin-version-history", label: "Version History", href: "/admin/version-history", icon: "History", children: [] },
    { id: "admin-components", label: "Components", href: "/admin/components", icon: "Box", children: [] },
    { id: "admin-dashboard-builder", label: "Dashboard Builder", href: "/admin/dashboard-builder", icon: "LayoutDashboard", children: [] },
    { id: "admin-layout-builder", label: "Layout Builder", href: "/admin/layout-builder", icon: "Layers", children: [] },
    { id: "admin-automation", label: "Automation", href: "/admin/automation", icon: "Zap", children: [] },
    { id: "admin-localization", label: "Localization", href: "/admin/localization", icon: "Languages", children: [] },
    { id: "admin-integrations", label: "Integrations", href: "/admin/integrations", icon: "Plug", children: [] },
    { id: "admin-api", label: "API", href: "/admin/api", icon: "Code", children: [] },
    { id: "admin-webhooks", label: "Webhooks", href: "/admin/webhooks", icon: "Webhook", children: [] },
    { id: "admin-accessibility", label: "Accessibility", href: "/admin/accessibility", icon: "Accessibility", children: [] },
    { id: "admin-settings", label: "Settings", href: "/admin/settings", icon: "Settings", children: [] },
  ],
  school: [
    { id: "school-dashboard", label: "Dashboard", href: "/school", icon: "LayoutDashboard", children: [] },
    { id: "school-staff", label: "Staff & Students", href: "/school/staff", icon: "Users", children: [] },
    { id: "school-courses", label: "Courses", href: "/school/courses", icon: "BookOpen", children: [] },
    { id: "school-contracts", label: "Contracts", href: "/school/contracts", icon: "FileText", children: [] },
    { id: "school-analytics", label: "Analytics", href: "/school/analytics", icon: "BarChart3", children: [] },
    { id: "school-settings", label: "Settings", href: "/school/settings", icon: "Settings", children: [] },
  ],
};

interface SidebarProps {
  role: Role;
  isOpen: boolean;
  onClose: () => void;
}

function renderNavItems(
  items: NavItemData[],
  pathname: string,
  onClose: () => void,
  depth = 0,
): React.ReactNode {
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
            {hasChildren && renderNavItems(item.children, pathname, onClose, depth + 1)}
          </li>
        );
      })}
    </ul>
  );
}

export function Sidebar({ role, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { items: fetchedItems, isLoading } = useNavigation(role);
  const items = fetchedItems.length > 0 ? fetchedItems : (fallbackNavItems[role] ?? []);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-card border-r border-border transition-transform duration-200 lg:static lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center gap-2 border-b border-border px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-sm font-bold text-white">
            N
          </div>
          <span className="text-lg font-bold text-card-foreground">NEOT</span>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground border-t-primary" />
            </div>
          ) : (
            renderNavItems(items, pathname, onClose)
          )}
        </nav>
      </aside>
    </>
  );
}
