import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import { createAuditLog, getAuditLogs, getAuditLogCount } from "@/lib/audit-log";

export async function GET(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const permError = await requirePermission(user.role, "settings", "read");
  if (permError) return permError;

  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action") ?? undefined;
  const resource = searchParams.get("resource") ?? undefined;
  const limit = Number(searchParams.get("limit")) || 50;
  const offset = Number(searchParams.get("offset")) || 0;

  const [logs, total] = await Promise.all([
    getAuditLogs({ action, resource, limit, offset }),
    getAuditLogCount({ action, resource }),
  ]);

  return NextResponse.json({ logs, total });
}

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const permError = await requirePermission(user.role, "settings", "update");
  if (permError) return permError;

  const body = await request.json();
  const { action, resource, resourceId, details } = body;

  if (!action || !resource) {
    return NextResponse.json({ error: "action and resource are required" }, { status: 400 });
  }

  const log = await createAuditLog({ action, resource, resourceId, userId: user.id, details });
  return NextResponse.json(log, { status: 201 });
}
