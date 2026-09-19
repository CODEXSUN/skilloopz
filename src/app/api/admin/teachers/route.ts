import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";

const listQuerySchema = z.object({
  search: z.string().optional(),
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

  const { search, page, limit } = parsed.data;

  const where: Record<string, unknown> = { role: "teacher" };

  if (search) {
    where.OR = [
      { email: { contains: search } },
      { fullName: { contains: search } },
    ];
  }

  const [teachers, total] = await Promise.all([
    prisma.profile.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        onboardingCompleted: true,
        metadata: true,
        createdAt: true,
        _count: {
          select: {
            courses: true,
          },
        },
        courses: {
          select: {
            _count: { select: { enrollments: true } },
          },
        },
      },
    }),
    prisma.profile.count({ where }),
  ]);

  const teachersWithStats = teachers.map((t) => {
    let metadata: Record<string, unknown> = {};
    try {
      metadata = JSON.parse(t.metadata ?? "{}");
    } catch {
      // ignore
    }

    const totalStudents = t.courses.reduce((sum, c) => sum + c._count.enrollments, 0);

    return {
      id: t.id,
      email: t.email,
      fullName: t.fullName,
      avatarUrl: t.avatarUrl,
      onboardingCompleted: t.onboardingCompleted,
      subjects: metadata.subjects as string[] | undefined,
      bio: metadata.bio as string | undefined,
      courseCount: t._count.courses,
      studentCount: totalStudents,
      createdAt: t.createdAt,
    };
  });

  return NextResponse.json({
    teachers: teachersWithStats,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
