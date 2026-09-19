import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const permError = await requirePermission(user.role, "backups", "update");
  if (permError) return permError;

  const { id } = await params;

  const record = await prisma.backupRecord.findUnique({ where: { id } });
  if (!record) {
    return NextResponse.json({ error: "Backup not found" }, { status: 404 });
  }

  try {
    await fs.access(record.filePath);
  } catch {
    return NextResponse.json({ error: "Backup file not found on disk" }, { status: 404 });
  }

  const dbUrl = process.env.DATABASE_URL ?? "file:prisma/dev.db";
  const dbPath = path.resolve(process.cwd(), dbUrl.replace("file:", ""));

  const tempBackup = dbPath + ".restore-temp";

  try {
    await fs.copyFile(dbPath, tempBackup);

    await fs.copyFile(record.filePath, dbPath);

    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      message: "Database restored from backup. The server may need to be restarted for changes to take full effect.",
    });
  } catch (error) {
    try {
      await fs.copyFile(tempBackup, dbPath);
    } catch {
      // unable to rollback
    }
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Restore failed",
    }, { status: 500 });
  } finally {
    try {
      await fs.unlink(tempBackup);
    } catch {
      // temp file cleanup
    }
  }
}
