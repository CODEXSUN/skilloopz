import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";

const listQuerySchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
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

  const { search, status, page, limit } = parsed.data;

  const where: Record<string, unknown> = { deletedAt: null };
  if (status && status !== "all") where.status = status;

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
      { teacher: { fullName: { contains: search } } },
    ];
  }

  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        teacher: { select: { id: true, fullName: true, avatarUrl: true } },
        category: { select: { id: true, name: true } },
        _count: { select: { enrollments: true, modules: true } },
      },
    }),
    prisma.course.count({ where }),
  ]);

  return NextResponse.json({
    courses,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
