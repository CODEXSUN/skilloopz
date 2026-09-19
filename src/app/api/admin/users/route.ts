import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";

const listQuerySchema = z.object({
  search: z.string().optional(),
  role: z.string().optional(),
  status: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export async function GET(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const permError = await requirePermission(user.role, "users", "read");
  if (permError) return permError;

  const { searchParams } = new URL(request.url);
  const parsed = listQuerySchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  const { search, role, page, limit } = parsed.data;

  const where: Record<string, unknown> = {};
  if (role) where.role = role;

  if (search) {
    where.OR = [
      { email: { contains: search } },
      { fullName: { contains: search } },
    ];
  }

  const [profiles, total] = await Promise.all([
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
        role: true,
        status: true,
        ageGroup: true,
        onboardingCompleted: true,
        metadata: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { enrollments: true, courses: true } },
      },
    }),
    prisma.profile.count({ where }),
  ]);

  return NextResponse.json({
    users: profiles,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
