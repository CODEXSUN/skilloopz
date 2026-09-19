import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";

const listQuerySchema = z.object({
  status: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});

const actionBodySchema = z.object({
  courseId: z.string(),
  action: z.enum(["approve", "archive", "restore", "feature"]),
});

export async function GET(request: Request) {
  const user = await getUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = listQuerySchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  const { status, page, limit } = parsed.data;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (status && status !== "all") where.status = status;

  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        teacher: { select: { id: true, fullName: true, email: true } },
        category: { select: { name: true } },
        _count: { select: { enrollments: true, modules: true } },
      },
    }),
    prisma.course.count({ where }),
  ]);

  return NextResponse.json({ courses, total, page, totalPages: Math.ceil(total / limit) });
}

export async function PATCH(request: Request) {
  const user = await getUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = actionBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { courseId, action } = parsed.data;

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const statusMap: Record<string, string> = {
    approve: "published",
    archive: "archived",
    restore: "draft",
    feature: course.status,
  };

  const updateData: Record<string, unknown> = {
    status: statusMap[action],
  };

  if (action === "archive") {
    updateData.deletedAt = new Date();
  } else if (action === "restore") {
    updateData.deletedAt = null;
  }

  if (action === "feature") {
    const metadata = (() => {
      try {
        return typeof course.metadata === "string" ? JSON.parse(course.metadata) : {};
      } catch {
        return {};
      }
    })();
    updateData.metadata = JSON.stringify({ ...metadata, featured: true });
  }

  await prisma.course.update({
    where: { id: courseId },
    data: updateData as never,
  });

  return NextResponse.json({ success: true, action });
}
