import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";

const listQuerySchema = z.object({
  status: z.string().optional(),
});

const updateBodySchema = z.object({
  id: z.string(),
  status: z.enum(["pending", "resolved", "dismissed"]),
});

export async function GET(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const parsed = listQuerySchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  const { status } = parsed.data;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;

  const reports = await prisma.report.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  const reporterIds = [...new Set(reports.map((r) => r.reportedBy))];
  const reporters = reporterIds.length > 0
    ? await prisma.profile.findMany({
        where: { id: { in: reporterIds } },
        select: { id: true, email: true, fullName: true },
      })
    : [];

  const reporterMap = new Map(reporters.map((p) => [p.id, { email: p.email, fullName: p.fullName }]));

  const reportsWithReporter = reports.map((r) => ({
    ...r,
    reporter: reporterMap.get(r.reportedBy) ?? null,
  }));

  return NextResponse.json({ reports: reportsWithReporter });
}

export async function PATCH(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const parsed = updateBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { id, status } = parsed.data;

  const report = await prisma.report.findUnique({ where: { id } });
  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  await prisma.report.update({
    where: { id },
    data: { status },
  });

  return NextResponse.json({ success: true });
}
