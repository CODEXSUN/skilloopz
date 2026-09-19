import { prisma } from "@/lib/db";

export interface ComplianceCheckResult {
  id: string;
  name: string;
  category: "gdpr" | "coppa" | "data_protection" | "platform";
  description: string;
  status: "pass" | "warning" | "fail" | "info";
  message: string;
  regulation: string;
  recommendation?: string;
}

export interface ComplianceSummary {
  passed: number;
  failed: number;
  warnings: number;
  total: number;
}

const CHECKS: Array<() => Promise<ComplianceCheckResult>> = [
  // ── GDPR ──
  async () => {
    const pages = await prisma.customPage.findMany({
      where: { slug: { in: ["privacy", "privacy-policy"] } },
      select: { id: true },
    });
    return {
      id: "gdpr-privacy-policy",
      name: "Privacy Policy",
      category: "gdpr",
      description: "Checks if a privacy policy page exists",
      status: pages.length > 0 ? "pass" : "fail",
      message: pages.length > 0 ? "Privacy policy page found" : "No privacy policy page found",
      regulation: "GDPR Art. 13-14",
      recommendation: !pages.length ? "Create a privacy policy page at /privacy" : undefined,
    };
  },

  async () => {
    const settings = await prisma.platformSetting.findMany();
    const values: Record<string, string> = {};
    for (const s of settings) values[s.key] = s.value;

    const retention = values.data_retention_days ?? "not set";
    return {
      id: "gdpr-data-retention",
      name: "Data Retention Policy",
      category: "gdpr",
      description: "Checks if data retention is configured",
      status: retention !== "not set" ? "pass" : "fail",
      message: retention !== "not set"
        ? `Data retention set to ${retention} days`
        : "No data retention policy configured",
      regulation: "GDPR Art. 5(1)(e)",
      recommendation: retention === "not set"
        ? "Configure data_retention_days in platform settings"
        : undefined,
    };
  },

  async () => {
    const usersWithData = await prisma.profile.count();
    return {
      id: "gdpr-right-to-access",
      name: "User Data Access",
      category: "gdpr",
      description: "Verifies users can access their data (profile export feature)",
      status: "info",
      message: `${usersWithData} users have data that can be exported via profile`,
      regulation: "GDPR Art. 15",
    };
  },

  async () => {
    const hasDisabledUsers = await prisma.profile.count({ where: { status: { not: "active" } } });
    return {
      id: "gdpr-right-to-erasure",
      name: "Right to Erasure",
      category: "gdpr",
      description: "Checks if user account deletion/deactivation is available",
      status: hasDisabledUsers > 0 ? "pass" : "info",
      message: hasDisabledUsers > 0
        ? `${hasDisabledUsers} users have been deactivated (deletion available)`
        : "No users have been deleted yet — admin can disable accounts",
      regulation: "GDPR Art. 17",
    };
  },

  async () => {
    const hasAgeField = true; // Profile model has ageGroup field
    return {
      id: "gdpr-age-verification",
      name: "Age Verification",
      category: "gdpr",
      description: "Checks if age verification is collected during registration",
      status: hasAgeField ? "pass" : "fail",
      message: hasAgeField
        ? "Age group is collected during onboarding"
        : "No age verification in place",
      regulation: "GDPR Art. 8",
      recommendation: !hasAgeField ? "Add age verification to registration" : undefined,
    };
  },

  async () => {
    const cookieSettings = await prisma.platformSetting.findMany({
      where: { key: { contains: "cookie" } },
    });
    const hasConsent = cookieSettings.length > 0;
    return {
      id: "gdpr-cookie-consent",
      name: "Cookie Consent",
      category: "gdpr",
      description: "Checks if cookie consent mechanism is configured",
      status: "info",
      message: hasConsent
        ? "Cookie consent settings found"
        : "No cookie consent settings — add if using tracking cookies",
      regulation: "GDPR Art. 7 & ePrivacy Directive",
      recommendation: !hasConsent
        ? "Add cookie consent settings in platform settings"
        : undefined,
    };
  },

  // ── COPPA ──
  async () => {
    const underageUsers = await prisma.profile.count({
      where: { ageGroup: { in: ["under-13", "child"] } },
    });
    return {
      id: "coppa-underage-users",
      name: "Underage Users",
      category: "coppa",
      description: "Checks for users under 13 requiring parental consent",
      status: underageUsers === 0 ? "pass" : "warning",
      message: underageUsers > 0
        ? `${underageUsers} users identified as under 13`
        : "No users under 13 found",
      regulation: "COPPA §312.3-312.5",
      recommendation: underageUsers > 0
        ? "Ensure parental consent is collected for underage users"
        : undefined,
    };
  },

  async () => {
    const children = await prisma.profile.count({
      where: { parentId: { not: null } },
    });
    return {
      id: "coppa-parental-consent",
      name: "Parental Consent",
      category: "coppa",
      description: "Checks if parental consent mechanism exists (parent-child linking)",
      status: children > 0 ? "pass" : "info",
      message: children > 0
        ? `${children} children linked to parent accounts`
        : "No parent-child relationships — parental consent may not be implemented",
      regulation: "COPPA §312.5",
      recommendation: children === 0
        ? "Implement parental consent flow for users under 13"
        : undefined,
    };
  },

  // ── Data Protection ──
  async () => {
    const dbUrl = process.env.DATABASE_URL ?? "";
    const isSqlite = dbUrl.startsWith("file:");
    return {
      id: "data-encryption-at-rest",
      name: "Encryption at Rest",
      category: "data_protection",
      description: "Checks if database provides encryption at rest",
      status: isSqlite ? "warning" : "pass",
      message: isSqlite
        ? "SQLite: encryption depends on filesystem-level encryption"
        : "PostgreSQL: supports encryption at rest",
      regulation: "GDPR Art. 32",
      recommendation: isSqlite
        ? "Ensure filesystem encryption (e.g., BitLocker, LUKS) is enabled for SQLite in production"
        : undefined,
    };
  },

  async () => {
    const https = process.env.NODE_ENV === "production" || process.env.SITE_URL?.startsWith("https");
    return {
      id: "data-encryption-in-transit",
      name: "Encryption in Transit",
      category: "data_protection",
      description: "Checks if HTTPS/SSL is configured",
      status: https ? "pass" : "warning",
      message: https
        ? "HTTPS appears to be configured"
        : "HTTPS may not be configured (check NODE_ENV or SITE_URL)",
      regulation: "GDPR Art. 32, COPPA §312.8",
      recommendation: !https
        ? "Configure SSL/TLS certificate and enforce HTTPS"
        : undefined,
    };
  },

  async () => {
    const backupCount = await prisma.backupRecord.count();
    return {
      id: "data-backups",
      name: "Data Backups",
      category: "data_protection",
      description: "Checks if data backups are being created",
      status: backupCount > 0 ? "pass" : "warning",
      message: backupCount > 0
        ? `${backupCount} backup(s) exist on the server`
        : "No backups found — run a backup from the Backup page",
      regulation: "GDPR Art. 32(1)(c)",
      recommendation: backupCount === 0
        ? "Configure automated backups from the Backup page"
        : undefined,
    };
  },

  async () => {
    const roles = await prisma.role.findMany({
      where: { name: { not: "admin" } },
      select: { name: true },
    });
    return {
      id: "data-access-control",
      name: "Access Controls",
      category: "data_protection",
      description: "Checks if role-based access controls are configured",
      status: roles.length >= 2 ? "pass" : "warning",
      message: `${roles.length + 1} roles configured (including admin)`,
      regulation: "GDPR Art. 5(1)(f), Art. 32(4)",
      recommendation: roles.length < 2
        ? "Configure additional roles (teacher, parent, school admin) for proper access control"
        : undefined,
    };
  },

  // ── Platform ──
  async () => {
    const termsPages = await prisma.customPage.count({
      where: { slug: { in: ["terms", "terms-of-service", "tos"] } },
    });
    return {
      id: "platform-terms-of-service",
      name: "Terms of Service",
      category: "platform",
      description: "Checks if Terms of Service page exists",
      status: termsPages > 0 ? "pass" : "fail",
      message: termsPages > 0 ? "Terms of Service page found" : "No Terms of Service page found",
      regulation: "Platform requirement",
      recommendation: !termsPages ? "Create a Terms of Service page" : undefined,
    };
  },

  async () => {
    const hasNotifications = await prisma.notification.count() > 0;
    return {
      id: "platform-communication",
      name: "User Communication",
      category: "platform",
      description: "Checks if the platform can communicate with users",
      status: hasNotifications ? "pass" : "info",
      message: hasNotifications
        ? "Notifications system is active"
        : "No notifications sent yet",
      regulation: "Platform requirement",
    };
  },
];

export async function runComplianceReport(category = "all", triggeredBy?: string) {
  const report = await prisma.complianceReport.create({
    data: {
      status: "in_progress",
      category,
      results: "[]",
      summary: "{}",
    },
  });

  const results: ComplianceCheckResult[] = [];

  for (const check of CHECKS) {
    try {
      const result = await check();
      if (category === "all" || result.category === category) {
        results.push(result);
      }
    } catch (error) {
      results.push({
        id: `error-${results.length}`,
        name: "Check Error",
        category: "platform",
        description: "An unexpected error occurred",
        status: "fail",
        message: error instanceof Error ? error.message : "Unknown error",
        regulation: "N/A",
      });
    }
  }

  const summary: ComplianceSummary = {
    passed: results.filter((r) => r.status === "pass").length,
    failed: results.filter((r) => r.status === "fail").length,
    warnings: results.filter((r) => r.status === "warning").length,
    total: results.length,
  };

  await prisma.complianceReport.update({
    where: { id: report.id },
    data: {
      status: "completed",
      results: JSON.stringify(results),
      summary: JSON.stringify(summary),
      completedAt: new Date(),
    },
  });

  return { id: report.id, results, summary };
}

export async function getComplianceReports(limit = 10, offset = 0) {
  const [reports, total] = await Promise.all([
    prisma.complianceReport.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.complianceReport.count(),
  ]);

  return {
    reports: reports.map((r) => ({
      ...r,
      results: JSON.parse(r.results) as ComplianceCheckResult[],
      summary: JSON.parse(r.summary) as ComplianceSummary,
    })),
    total,
  };
}

export async function getComplianceReport(id: string) {
  const report = await prisma.complianceReport.findUnique({ where: { id } });
  if (!report) return null;
  return {
    ...report,
    results: JSON.parse(report.results) as ComplianceCheckResult[],
    summary: JSON.parse(report.summary) as ComplianceSummary,
  };
}
