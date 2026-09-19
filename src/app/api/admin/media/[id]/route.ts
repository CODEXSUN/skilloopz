import { NextResponse } from "next/server";
import { unlink } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit-log";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  const media = await prisma.media.findUnique({ where: { id } });
  if (!media) {
    return NextResponse.json({ error: "Media not found" }, { status: 404 });
  }

  const filePath = path.join(process.cwd(), "public", media.url);
  try {
    await unlink(filePath);
  } catch {
    // File may not exist on disk, that's ok
  }

  await createAuditLog({
    action: "delete",
    resource: "media",
    resourceId: media.id,
    userId: user.id,
    details: { filename: media.originalName },
  });

  await prisma.media.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
