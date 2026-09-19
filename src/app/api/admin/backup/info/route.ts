import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getUser } from "@/lib/auth";

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const dbUrl = process.env.DATABASE_URL ?? "file:prisma/dev.db";
  const dbPath = path.resolve(process.cwd(), dbUrl.replace("file:", ""));
  const stat = await fs.stat(dbPath);

  return NextResponse.json({
    sizeBytes: stat.size,
    lastModified: stat.mtime.toISOString(),
  });
}
