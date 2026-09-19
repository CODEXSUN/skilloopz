import { prisma } from "@/lib/db";

export type SisConfigData = {
  id: string;
  name: string;
  provider: string;
  apiUrl: string | null;
  apiKey: string | null;
  csvMapping: string;
  schoolId: string | null;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export async function getSisConfigs(): Promise<SisConfigData[]> {
  const configs = await prisma.sisConfig.findMany({ orderBy: { createdAt: "asc" } });
  return configs.map((c) => ({
    id: c.id,
    name: c.name,
    provider: c.provider,
    apiUrl: c.apiUrl,
    apiKey: c.apiKey,
    csvMapping: c.csvMapping,
    schoolId: c.schoolId,
    enabled: c.enabled,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  }));
}

export async function getSisConfig(id: string): Promise<SisConfigData | null> {
  const c = await prisma.sisConfig.findUnique({ where: { id } });
  if (!c) return null;
  return {
    id: c.id,
    name: c.name,
    provider: c.provider,
    apiUrl: c.apiUrl,
    apiKey: c.apiKey,
    csvMapping: c.csvMapping,
    schoolId: c.schoolId,
    enabled: c.enabled,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}

export async function createSisConfig(data: {
  name: string;
  provider: string;
  apiUrl?: string;
  apiKey?: string;
  csvMapping?: string;
  schoolId?: string;
  enabled?: boolean;
}): Promise<SisConfigData> {
  const c = await prisma.sisConfig.create({ data });
  return {
    id: c.id,
    name: c.name,
    provider: c.provider,
    apiUrl: c.apiUrl,
    apiKey: c.apiKey,
    csvMapping: c.csvMapping,
    schoolId: c.schoolId,
    enabled: c.enabled,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}

export async function updateSisConfig(
  id: string,
  data: Partial<{
    name: string;
    provider: string;
    apiUrl: string | null;
    apiKey: string | null;
    csvMapping: string;
    schoolId: string | null;
    enabled: boolean;
  }>,
): Promise<SisConfigData | null> {
  const c = await prisma.sisConfig.update({ where: { id }, data });
  return {
    id: c.id,
    name: c.name,
    provider: c.provider,
    apiUrl: c.apiUrl,
    apiKey: c.apiKey,
    csvMapping: c.csvMapping,
    schoolId: c.schoolId,
    enabled: c.enabled,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}

export async function deleteSisConfig(id: string): Promise<void> {
  await prisma.sisConfig.delete({ where: { id } });
}

export async function createSisSyncLog(configId: string): Promise<string> {
  const log = await prisma.sisSyncLog.create({
    data: { configId, status: "in_progress" },
  });
  return log.id;
}

export async function updateSisSyncLog(
  logId: string,
  data: {
    status?: string;
    recordsSynced?: number;
    recordsFailed?: number;
    errors?: string;
    summary?: string;
  },
): Promise<void> {
  await prisma.sisSyncLog.update({
    where: { id: logId },
    data: { ...data, completedAt: data.status !== "in_progress" ? new Date() : undefined },
  });
}

export async function getSisSyncLogs(configId?: string, limit = 20): Promise<
  {
    id: string;
    configId: string;
    status: string;
    recordsSynced: number;
    recordsFailed: number;
    errors: string;
    summary: string;
    createdAt: Date;
    completedAt: Date | null;
  }[]
> {
  const logs = await prisma.sisSyncLog.findMany({
    where: configId ? { configId } : undefined,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return logs.map((l) => ({
    id: l.id,
    configId: l.configId,
    status: l.status,
    recordsSynced: l.recordsSynced,
    recordsFailed: l.recordsFailed,
    errors: l.errors,
    summary: l.summary,
    createdAt: l.createdAt,
    completedAt: l.completedAt,
  }));
}

export async function processCsvUpload(
  csvContent: string,
  mapping: Record<string, string>,
  schoolId: string | null,
): Promise<{ synced: number; failed: number; errors: string[] }> {
  const lines = csvContent.trim().split("\n");
  if (lines.length < 2) return { synced: 0, failed: 0, errors: ["CSV has no data rows"] };

  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  const rows = lines.slice(1);

  let synced = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const row of rows) {
    const values = row.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    const record: Record<string, string> = {};
    for (let i = 0; i < headers.length; i++) {
      record[headers[i]] = values[i] || "";
    }

    const email = record[mapping.email] || "";
    const firstName = record[mapping.firstName] || "";
    const lastName = record[mapping.lastName] || "";
    const externalId = record[mapping.externalId] || "";
    const role = record[mapping.role] || "student";
    const grade = record[mapping.grade] || "";

    if (!email) {
      failed++;
      errors.push(`Row ${synced + failed + 1}: Missing email`);
      continue;
    }

    try {
      const existing = await prisma.profile.findFirst({ where: { email } });
      if (existing) {
        await prisma.profile.update({
          where: { id: existing.id },
          data: {
            fullName: `${firstName} ${lastName}`.trim() || existing.fullName,
            schoolId: schoolId || existing.schoolId,
            metadata: JSON.stringify({ ...JSON.parse(existing.metadata || "{}"), sisExternalId: externalId, grade }),
          },
        });
        synced++;
      } else {
        await prisma.profile.create({
          data: {
            id: crypto.randomUUID(),
            email,
            fullName: `${firstName} ${lastName}`.trim() || null,
            role: role.toLowerCase() === "teacher" ? "teacher" : "student",
            schoolId,
            metadata: JSON.stringify({ sisExternalId: externalId, grade }),
          },
        });
        synced++;
      }
    } catch (err) {
      failed++;
      errors.push(`Row ${synced + failed}: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  }

  return { synced, failed, errors };
}
