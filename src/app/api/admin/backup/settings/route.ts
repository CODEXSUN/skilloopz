import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const permError = await requirePermission(user.role, "backups", "read");
  if (permError) return permError;

  const settings = await prisma.platformSetting.findMany({
    where: { group: "backup" },
  });

  const values: Record<string, string> = {};
  for (const s of settings) {
    values[s.key] = s.value;
  }

  return NextResponse.json({
    autoBackupEnabled: values.auto_backup_enabled === "true",
    autoBackupFrequency: values.auto_backup_frequency ?? "daily",
    backupRetentionDays: parseInt(values.backup_retention_days || "30", 10),
    backupTime: values.backup_time ?? "02:00",
  });
}

export async function PUT(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const permError = await requirePermission(user.role, "backups", "update");
  if (permError) return permError;

  const body = await request.json();
  const { autoBackupEnabled, autoBackupFrequency, backupRetentionDays, backupTime } = body;

  const upserts = [
    { key: "auto_backup_enabled", value: String(autoBackupEnabled ?? false) },
    { key: "auto_backup_frequency", value: autoBackupFrequency ?? "daily" },
    { key: "backup_retention_days", value: String(backupRetentionDays ?? 30) },
    { key: "backup_time", value: backupTime ?? "02:00" },
  ];

  for (const { key, value } of upserts) {
    await prisma.platformSetting.upsert({
      where: { key },
      create: { key, value, group: "backup" },
      update: { value },
    });
  }

  return NextResponse.json({ success: true });
}
