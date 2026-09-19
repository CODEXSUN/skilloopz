import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { createAuditLog } from "@/lib/audit-log";
import { getCdnConfig, transformMediaUrl } from "@/lib/cdn";

export async function GET(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");
  const mimeType = searchParams.get("mimeType");
  const folder = searchParams.get("folder");
  const foldersOnly = searchParams.get("foldersOnly") === "true";

  if (foldersOnly) {
    const result = await prisma.media.findMany({
      select: { folder: true },
      distinct: ["folder"],
      orderBy: { folder: "asc" },
    });
    return NextResponse.json(result.map((r) => r.folder));
  }

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { originalName: { contains: search } },
      { filename: { contains: search } },
      { alt: { contains: search } },
    ];
  }
  if (mimeType) {
    where.mimeType = { startsWith: mimeType };
  }
  if (folder && folder !== "all") {
    where.folder = folder;
  }

  const media = await prisma.media.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      uploadedBy: { select: { id: true, fullName: true } },
    },
  });

  const cdnConfig = await getCdnConfig();

  const enriched = media.map((item) => ({
    ...item,
    cdnUrl: transformMediaUrl(cdnConfig, item.url),
  }));

  return NextResponse.json(enriched);
}

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml", "application/pdf", "text/plain", "text/csv", "application/json"];
  if (!allowedTypes.includes(file.type) && !file.type.startsWith("video/") && !file.type.startsWith("audio/")) {
    return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const ext = path.extname(file.name) || ".bin";
  const safeName = `${crypto.randomUUID()}${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  const filePath = path.join(uploadDir, safeName);

  await mkdir(uploadDir, { recursive: true });
  await writeFile(filePath, buffer);

  const alt = formData.get("alt") as string | null;
  const folder = formData.get("folder") as string | null;

  const media = await prisma.media.create({
    data: {
      filename: safeName,
      originalName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      url: `/uploads/${safeName}`,
      alt,
      folder: folder || "uncategorized",
      uploadedById: user.id,
    },
  });

  await createAuditLog({
    action: "create",
    resource: "media",
    resourceId: media.id,
    userId: user.id,
    details: { filename: file.name, mimeType: file.type, sizeBytes: file.size },
  });

  return NextResponse.json(media, { status: 201 });
}
