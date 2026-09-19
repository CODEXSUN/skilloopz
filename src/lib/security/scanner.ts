import { prisma } from "@/lib/db";

export interface SecurityCheckResult {
  id: string;
  name: string;
  description: string;
  status: "pass" | "warning" | "fail" | "info";
  message: string;
  recommendation?: string;
}

export interface ScanSummary {
  passed: number;
  failed: number;
  warnings: number;
  total: number;
}

const CHECKS: Array<() => Promise<SecurityCheckResult>> = [
  async () => {
    const settings = await prisma.platformSetting.findMany({ where: { group: "security" } });
    const values: Record<string, string> = {};
    for (const s of settings) values[s.key] = s.value;

    const minLength = parseInt(values.password_min_length || "8", 10);
    return {
      id: "password-policy",
      name: "Password Policy",
      description: "Checks minimum password length requirement",
      status: minLength >= 8 ? "pass" : "fail",
      message: `Minimum password length is ${minLength} characters`,
      recommendation: minLength < 8 ? "Set password_min_length to at least 8" : undefined,
    };
  },

  async () => {
    const settings = await prisma.platformSetting.findMany({ where: { group: "security" } });
    const values: Record<string, string> = {};
    for (const s of settings) values[s.key] = s.value;

    const requireSpecial = values.password_require_special === "true";
    return {
      id: "password-complexity",
      name: "Password Complexity",
      description: "Checks if special characters are required in passwords",
      status: requireSpecial ? "pass" : "warning",
      message: requireSpecial ? "Special characters required" : "No special character requirement",
      recommendation: !requireSpecial ? "Enable special character requirement in security settings" : undefined,
    };
  },

  async () => {
    const regSetting = await prisma.platformSetting.findUnique({ where: { key: "allow_public_registration" } });
    const isOpen = regSetting?.value !== "false";
    return {
      id: "public-registration",
      name: "Public Registration",
      description: "Checks if public user registration is open",
      status: isOpen ? "warning" : "pass",
      message: isOpen ? "Public registration is enabled" : "Public registration is disabled",
      recommendation: isOpen ? "Disable public registration if this is a private platform" : undefined,
    };
  },

  async () => {
    const settings = await prisma.platformSetting.findMany({ where: { group: "security" } });
    const values: Record<string, string> = {};
    for (const s of settings) values[s.key] = s.value;

    const ttl = parseInt(values.session_ttl_hours || "168", 10);
    return {
      id: "session-ttl",
      name: "Session TTL",
      description: "Checks session expiration time",
      status: ttl <= 72 ? "pass" : ttl <= 168 ? "warning" : "fail",
      message: `Session expires after ${ttl} hours (${(ttl / 24).toFixed(1)} days)`,
      recommendation: ttl > 72 ? "Consider reducing session TTL to 72 hours (3 days) or less" : undefined,
    };
  },

  async () => {
    const settings = await prisma.platformSetting.findMany({ where: { group: "security" } });
    const values: Record<string, string> = {};
    for (const s of settings) values[s.key] = s.value;

    const maxAttempts = parseInt(values.max_login_attempts || "5", 10);
    return {
      id: "login-rate-limit",
      name: "Login Rate Limiting",
      description: "Checks if login attempt limits are configured",
      status: maxAttempts <= 10 ? "pass" : "warning",
      message: `Max ${maxAttempts} login attempts before lockout`,
      recommendation: maxAttempts > 10 ? "Reduce max login attempts to 10 or fewer" : undefined,
    };
  },

  async () => {
    const dbUrl = process.env.DATABASE_URL ?? "";
    const isSqlite = dbUrl.startsWith("file:");
    return {
      id: "database-type",
      name: "Database Type",
      description: "Checks if using a production-grade database",
      status: isSqlite ? "warning" : "pass",
      message: isSqlite ? "Using SQLite (suitable for development only)" : "Using PostgreSQL or other production database",
      recommendation: isSqlite ? "Use PostgreSQL for production deployments" : undefined,
    };
  },

  async () => {
    const adminCount = await prisma.profile.count({
      where: { role: "admin", status: "active" },
    });
    return {
      id: "admin-accounts",
      name: "Admin Accounts",
      description: "Checks number of active admin accounts",
      status: adminCount <= 3 ? "pass" : adminCount <= 5 ? "warning" : "fail",
      message: `${adminCount} active admin account${adminCount !== 1 ? "s" : ""}`,
      recommendation: adminCount > 3 ? "Review admin accounts and remove unnecessary ones" : undefined,
    };
  },

  async () => {
    const userCount = await prisma.profile.count({
      where: { status: "active" },
    });
    const disabledCount = await prisma.profile.count({
      where: { status: { not: "active" } },
    });
    return {
      id: "disabled-accounts",
      name: "Disabled Accounts",
      description: "Checks for disabled/stale accounts",
      status: "info",
      message: `${userCount} active users, ${disabledCount} inactive`,
    };
  },

  async () => {
    const unsafeSettings = await prisma.platformSetting.findMany({
      where: {
        key: { in: ["site_url", "app_url"] },
        value: { contains: "localhost" },
      },
    });
    return {
      id: "production-url",
      name: "Production URL",
      description: "Checks if the platform URL is configured for production",
      status: unsafeSettings.length > 0 ? "warning" : "pass",
      message: unsafeSettings.length > 0
        ? "Some URLs still point to localhost"
        : "No localhost references in URL settings",
      recommendation: unsafeSettings.length > 0
        ? "Update site_url and app_url to your production domain"
        : undefined,
    };
  },

  async () => {
    const rateLimitEnabled = await prisma.platformSetting.findUnique({
      where: { key: "rate_limit_enabled" },
    });
    const isEnabled = rateLimitEnabled?.value !== "false";
    return {
      id: "rate-limiting",
      name: "API Rate Limiting",
      description: "Checks if API rate limiting is enabled",
      status: isEnabled ? "pass" : "warning",
      message: isEnabled ? "Rate limiting is enabled" : "Rate limiting is disabled",
      recommendation: !isEnabled ? "Enable rate limiting to protect against abuse" : undefined,
    };
  },

  async () => {
    const users = await prisma.profile.findMany({
      select: { id: true, email: true },
      take: 100,
    });
    return {
      id: "user-base",
      name: "User Base",
      description: "Checks total registered users",
      status: "info",
      message: `${users.length}+ registered users (sample)`,
    };
  },
];

export async function runSecurityScan(triggeredBy?: string): Promise<{
  id: string;
  results: SecurityCheckResult[];
  summary: ScanSummary;
}> {
  const scan = await prisma.securityScan.create({
    data: {
      status: "in_progress",
      triggeredBy: triggeredBy ?? null,
    },
  });

  const results: SecurityCheckResult[] = [];

  for (const check of CHECKS) {
    try {
      const result = await check();
      results.push(result);
    } catch (error) {
      results.push({
        id: `error-${results.length}`,
        name: "Check Error",
        description: "An unexpected error occurred during this check",
        status: "fail",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  const summary: ScanSummary = {
    passed: results.filter((r) => r.status === "pass").length,
    failed: results.filter((r) => r.status === "fail").length,
    warnings: results.filter((r) => r.status === "warning").length,
    total: results.length,
  };

  await prisma.securityScan.update({
    where: { id: scan.id },
    data: {
      status: "completed",
      results: JSON.stringify(results),
      summary: JSON.stringify(summary),
      completedAt: new Date(),
    },
  });

  return { id: scan.id, results, summary };
}

export async function getSecurityScans(limit = 10, offset = 0) {
  const [scans, total] = await Promise.all([
    prisma.securityScan.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.securityScan.count(),
  ]);

  return {
    scans: scans.map((s) => ({
      ...s,
      results: JSON.parse(s.results) as SecurityCheckResult[],
      summary: JSON.parse(s.summary) as ScanSummary,
    })),
    total,
  };
}

export async function getSecurityScan(id: string) {
  const scan = await prisma.securityScan.findUnique({ where: { id } });
  if (!scan) return null;
  return {
    ...scan,
    results: JSON.parse(scan.results) as SecurityCheckResult[],
    summary: JSON.parse(scan.summary) as ScanSummary,
  };
}
