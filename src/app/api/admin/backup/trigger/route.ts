import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";

export async function POST() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const permError = await requirePermission(user.role, "backups", "create");
  if (permError) return permError;

  const dbUrl = process.env.DATABASE_URL ?? "file:prisma/dev.db";
  const dbPath = path.resolve(process.cwd(), dbUrl.replace("file:", ""));
  const backupsDir = path.resolve(process.cwd(), "backups");

  await fs.mkdir(backupsDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `neot-backup-${timestamp}.db`;
  const filePath = path.join(backupsDir, filename);

  await fs.copyFile(dbPath, filePath);

  const stat = await fs.stat(filePath);

  const record = await prisma.backupRecord.create({
    data: {
      filename,
      sizeBytes: stat.size,
      status: "completed",
      type: "manual",
      notes: `Manual backup by ${user.email ?? user.id}`,
      filePath,
    },
  });

  return NextResponse.json({ success: true, record }, { status: 201 });
}
