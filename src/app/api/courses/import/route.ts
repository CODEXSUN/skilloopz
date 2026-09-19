import { NextResponse } from "next/server";
import { z } from "zod";

import { getUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";

const lessonSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional().nullable(),
  sortOrder: z.number().int().min(0),
  content: z.string().optional().default("{}"),
  estimatedMinutes: z.number().int().positive().optional().nullable(),
});

const moduleSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional().nullable(),
  sortOrder: z.number().int().min(0),
  lessons: z.array(lessonSchema).default([]),
});

const courseSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional().nullable(),
  subject: z.string().optional().nullable(),
  gradeLevel: z.string().optional().nullable(),
  ageRange: z.string().optional().nullable(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional().default("beginner"),
  estimatedMinutes: z.number().int().positive().optional().nullable(),
  category: z.string().optional().nullable(),
  tags: z.array(z.string()).default([]),
  modules: z.array(moduleSchema).default([]),
});

const importSchema = z.object({
  version: z.string().optional(),
  exportedAt: z.string().optional(),
  course: courseSchema,
});

export async function POST(request: Request) {
  const userId = await getUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.profile.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!profile || (profile.role !== "teacher" && profile.role !== "admin" && profile.role !== "superadmin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = importSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { course: data } = parsed.data;

  const result = await prisma.$transaction(async (tx) => {
    let categoryId: string | undefined;

    if (data.category) {
      const existing = await tx.category.findUnique({ where: { slug: data.category.toLowerCase().replace(/\s+/g, "-") } });
      if (existing) {
        categoryId = existing.id;
      } else {
        const cat = await tx.category.create({
          data: {
            name: data.category,
            slug: data.category.toLowerCase().replace(/\s+/g, "-"),
          },
        });
        categoryId = cat.id;
      }
    }

    const course = await tx.course.create({
      data: {
        title: data.title,
        description: data.description ?? "",
        subject: data.subject,
        gradeLevel: data.gradeLevel,
        ageRange: data.ageRange,
        difficulty: data.difficulty,
        estimatedMinutes: data.estimatedMinutes,
        categoryId,
        teacherId: userId,
        status: "draft",
      },
    });

    for (const tagName of data.tags) {
      const slug = tagName.toLowerCase().replace(/\s+/g, "-");
      let tag = await tx.tag.findUnique({ where: { slug } });
      if (!tag) {
        tag = await tx.tag.create({ data: { name: tagName, slug } });
      }
      await tx.courseTag.create({
        data: { courseId: course.id, tagId: tag.id },
      });
    }

    for (const mod of data.modules) {
      const module_ = await tx.module.create({
        data: {
          courseId: course.id,
          title: mod.title,
          description: mod.description ?? "",
          sortOrder: mod.sortOrder,
        },
      });

      for (const lesson of mod.lessons) {
        await tx.lesson.create({
          data: {
            moduleId: module_.id,
            title: lesson.title,
            description: lesson.description ?? "",
            sortOrder: lesson.sortOrder,
            content: lesson.content,
            estimatedMinutes: lesson.estimatedMinutes,
            status: "draft",
          },
        });
      }
    }

    return tx.course.findUnique({
      where: { id: course.id },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        tags: { select: { tag: { select: { id: true, name: true } } } },
        modules: {
          orderBy: { sortOrder: "asc" },
          include: {
            _count: { select: { lessons: true } },
          },
        },
      },
    });
  });

  return NextResponse.json(result, { status: 201 });
}
