import { prisma } from "@/lib/db";

export type NavItemData = {
  id: string;
  label: string;
  href: string;
  icon?: string;
  children: NavItemData[];
};

const fallbackNavItems: Record<string, NavItemData[]> = {
  student: [
    { id: "student-home", label: "Home", href: "/dashboard", icon: "LayoutDashboard", children: [] },
    { id: "student-courses", label: "My Courses", href: "/dashboard/courses", icon: "BookOpen", children: [] },
    { id: "student-messages", label: "Messages", href: "/dashboard/messages", icon: "Mail", children: [] },
    { id: "student-achievements", label: "Achievements", href: "/dashboard/achievements", icon: "Award", children: [] },
    { id: "student-analytics", label: "Analytics", href: "/dashboard/analytics", icon: "BarChart3", children: [] },
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
    { id: "admin-analytics-config", label: "Analytics Config", href: "/admin/analytics/config", icon: "Settings", children: [] },
    { id: "admin-users", label: "Users", href: "/admin/users", icon: "Users", children: [] },
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
    { id: "admin-error-logs", label: "Error Logs", href: "/admin/error-logs", icon: "Bug", children: [] },
    { id: "admin-audit-logs", label: "Audit Logs", href: "/admin/audit-logs", icon: "ClipboardList", children: [] },
    { id: "admin-security", label: "Security", href: "/admin/security", icon: "Shield", children: [] },
    { id: "admin-sso", label: "SSO / SAML", href: "/admin/sso", icon: "LogIn", children: [] },
    { id: "admin-backup", label: "Backup", href: "/admin/backup", icon: "Database", children: [] },
    { id: "admin-version-history", label: "Version History", href: "/admin/version-history", icon: "History", children: [] },
    { id: "admin-components", label: "Components", href: "/admin/components", icon: "Box", children: [] },
    { id: "admin-dashboard-builder", label: "Dashboard Builder", href: "/admin/dashboard-builder", icon: "LayoutDashboard", children: [] },
    { id: "admin-automation", label: "Automation", href: "/admin/automation", icon: "Zap", children: [] },
    { id: "admin-localization", label: "Localization", href: "/admin/localization", icon: "Languages", children: [] },
    { id: "admin-cdn", label: "CDN", href: "/admin/cdn", icon: "Globe", children: [] },
    { id: "admin-integrations", label: "Integrations", href: "/admin/integrations", icon: "Plug", children: [] },
    { id: "admin-email", label: "Email Service", href: "/admin/email", icon: "Mail", children: [] },
    { id: "admin-stripe", label: "Stripe", href: "/admin/stripe", icon: "CreditCard", children: [] },
    { id: "admin-lti", label: "LTI Integration", href: "/admin/lti", icon: "GraduationCap", children: [] },
    { id: "admin-sis", label: "SIS Integration", href: "/admin/sis", icon: "Database", children: [] },
    { id: "admin-marketplace-apps", label: "App Marketplace", href: "/admin/marketplace-apps", icon: "Puzzle", children: [] },
    { id: "admin-plugins", label: "Plugins", href: "/admin/plugins", icon: "Power", children: [] },
    { id: "admin-api", label: "API", href: "/admin/api", icon: "Code", children: [] },
    { id: "admin-accessibility", label: "Accessibility", href: "/admin/accessibility", icon: "Accessibility", children: [] },
    { id: "admin-compliance", label: "Compliance", href: "/admin/compliance", icon: "ClipboardCheck", children: [] },
    { id: "admin-load-test", label: "Load Test", href: "/admin/load-test", icon: "Gauge", children: [] },
    { id: "admin-performance", label: "Performance", href: "/admin/performance", icon: "Activity", children: [] },
    { id: "admin-system-health", label: "System Health", href: "/admin/system-health", icon: "Server", children: [] },
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

export async function getNavItems(role: string): Promise<NavItemData[]> {
  const dbItems = await prisma.navItem.findMany({
    where: {
      role: { in: ["all", role] },
      isVisible: true,
    },
    orderBy: { sortOrder: "asc" },
  });

  if (dbItems.length === 0) {
    return fallbackNavItems[role] ?? [];
  }

  const childrenMap = new Map<string, typeof dbItems>();

  for (const item of dbItems) {
    if (item.parentId) {
      const list = childrenMap.get(item.parentId);
      if (list) list.push(item);
      else childrenMap.set(item.parentId, [item]);
    }
  }

  function toTree(items: typeof dbItems): NavItemData[] {
    return items.map((item) => ({
      id: item.id,
      label: item.label,
      href: item.href,
      icon: item.icon ?? undefined,
      children: toTree(childrenMap.get(item.id) ?? []),
    }));
  }

  return toTree(dbItems.filter((i) => !i.parentId));
}
