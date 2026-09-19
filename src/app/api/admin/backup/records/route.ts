import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";

export async function GET(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const permError = await requirePermission(user.role, "backups", "read");
  if (permError) return permError;

  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get("limit")) || 50, 200);
  const offset = Number(searchParams.get("offset")) || 0;
  const type = searchParams.get("type") ?? undefined;

  const where: Record<string, unknown> = {};
  if (type) where.type = type;

  const [records, total] = await Promise.all([
    prisma.backupRecord.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.backupRecord.count({ where }),
  ]);

  const totalSizeBytes = await prisma.backupRecord.aggregate({
    _sum: { sizeBytes: true },
  });

  return NextResponse.json({
    records,
    total,
    totalSizeBytes: totalSizeBytes._sum.sizeBytes ?? 0,
  });
}

export async function DELETE(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const permError = await requirePermission(user.role, "backups", "delete");
  if (permError) return permError;

  const { id } = await request.json();
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const record = await prisma.backupRecord.findUnique({ where: { id } });
  if (!record) {
    return NextResponse.json({ error: "Backup not found" }, { status: 404 });
  }

  try {
    await fs.unlink(record.filePath);
  } catch {
    // file may already be deleted
  }

  await prisma.backupRecord.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
