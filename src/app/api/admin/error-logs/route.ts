import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";

export async function GET(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const permError = await requirePermission(user.role, "settings", "read");
  if (permError) return permError;

  const { searchParams } = new URL(request.url);
  const level = searchParams.get("level") ?? undefined;
  const source = searchParams.get("source") ?? undefined;
  const resolved = searchParams.get("resolved");
  const limit = Math.min(Number(searchParams.get("limit")) || 50, 200);
  const offset = Number(searchParams.get("offset")) || 0;

  const where: Record<string, unknown> = {};
  if (level) where.level = level;
  if (source) where.source = source;
  if (resolved === "true") where.resolved = true;
  else if (resolved === "false") where.resolved = false;

  const [logs, total, errorCount, warningCount] = await Promise.all([
    prisma.errorLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.errorLog.count({ where }),
    prisma.errorLog.count({ where: { level: "error" } }),
    prisma.errorLog.count({ where: { level: "warning" } }),
  ]);

  return NextResponse.json({ logs, total, errorCount, warningCount });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { message, stack, level, source, url, method, statusCode, metadata } = body;

  if (!message) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  const user = await getUser();

  const log = await prisma.errorLog.create({
    data: {
      message,
      stack: stack ?? null,
      level: level ?? "error",
      source: source ?? "frontend",
      url: url ?? null,
      method: method ?? null,
      statusCode: statusCode ? Number(statusCode) : null,
      userId: user?.id ?? null,
      userAgent: request.headers.get("user-agent") ?? null,
      metadata: JSON.stringify(metadata ?? {}),
    },
  });

  return NextResponse.json(log, { status: 201 });
}
