import { NextResponse } from "next/server";
import { z } from "zod";

import { getUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";

const createCourseSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  subject: z.string().optional(),
  gradeLevel: z.string().optional(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  estimatedMinutes: z.number().int().positive().optional(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("categoryId");
  const tag = searchParams.get("tag");
  const status = searchParams.get("status") ?? "published";
  const teacherId = searchParams.get("teacherId");
  const search = searchParams.get("search");

  const where: Record<string, unknown> = { deletedAt: null };

  if (categoryId) where.categoryId = categoryId;
  if (status && status !== "all") where.status = status;
  if (teacherId) where.teacherId = teacherId;
  if (tag) {
    where.tags = { some: { tag: { slug: tag } } };
  }
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
      { subject: { contains: search } },
    ];
  }

  const courses = await prisma.course.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      category: { select: { id: true, name: true, slug: true } },
      teacher: { select: { id: true, fullName: true, avatarUrl: true } },
      tags: { select: { tag: { select: { id: true, name: true, slug: true } } } },
      _count: { select: { modules: true, enrollments: true } },
    },
  });

  return NextResponse.json(courses, {
    headers: { "Cache-Control": "public, max-age=60, s-maxage=120" },
  });
}

export async function POST(request: Request) {
  const userId = await getUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createCourseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const course = await prisma.course.create({
    data: {
      ...parsed.data,
      teacherId: userId,
    },
  });

  return NextResponse.json(course, { status: 201 });
}
