import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";

const listQuerySchema = z.object({
  role: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});

const actionBodySchema = z.object({
  userId: z.string(),
  action: z.enum(["ban", "unban", "approve_teacher"]),
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

  const { role, status, search, page, limit } = parsed.data;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (role && role !== "all") where.role = role;
  if (status && status !== "all") where.status = status;
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
      skip,
      take: limit,
      select: {
        id: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        role: true,
        status: true,
        ageGroup: true,
        xp: true,
        level: true,
        currentStreak: true,
        createdAt: true,
        _count: { select: { enrollments: true, courses: true } },
      },
    }),
    prisma.profile.count({ where }),
  ]);

  return NextResponse.json({ users: profiles, total, page, totalPages: Math.ceil(total / limit) });
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

  const { userId, action } = parsed.data;

  const profile = await prisma.profile.findUnique({ where: { id: userId } });
  if (!profile) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (action === "ban") {
    await prisma.profile.update({
      where: { id: userId },
      data: { status: "banned" },
    });
    await prisma.session.deleteMany({ where: { userId } });
  } else if (action === "unban") {
    await prisma.profile.update({
      where: { id: userId },
      data: { status: "active" },
    });
  } else if (action === "approve_teacher") {
    await prisma.profile.update({
      where: { id: userId },
      data: { role: "teacher", status: "active" },
    });
  }

  return NextResponse.json({ success: true, action });
}
