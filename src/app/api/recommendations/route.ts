import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";

export async function GET() {
  const user = await getUser();

  if (!user) {
    const popular = await prisma.course.findMany({
      where: {
        status: "published",
        deletedAt: null,
      },
      include: {
        _count: { select: { enrollments: true } },
        category: { select: { id: true, name: true, slug: true } },
        teacher: { select: { fullName: true } },
      },
      orderBy: {
        enrollments: { _count: "desc" },
      },
      take: 8,
    });

    return NextResponse.json(
      popular.map((c) => ({
        id: c.id,
        title: c.title,
        thumbnailUrl: c.thumbnailUrl,
        category: c.category,
        teacherName: c.teacher.fullName ?? "",
        enrollmentCount: c._count.enrollments,
      }))
    );
  }

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: user.id },
    include: {
      course: {
        select: { id: true, categoryId: true },
      },
    },
  });

  const enrolledCourseIds = enrollments.map((e) => e.course.id);
  const categoryIds = [
    ...new Set(
      enrollments
        .map((e) => e.course.categoryId)
        .filter((id): id is string => id !== null)
    ),
  ];

  const results: {
    id: string;
    title: string;
    thumbnailUrl: string | null;
    category: { id: string; name: string; slug: string } | null;
    teacherName: string;
    enrollmentCount: number;
  }[] = [];

  if (categoryIds.length > 0) {
    const categoryCourses = await prisma.course.findMany({
      where: {
        status: "published",
        deletedAt: null,
        categoryId: { in: categoryIds },
        id: { notIn: enrolledCourseIds },
      },
      include: {
        _count: { select: { enrollments: true } },
        category: { select: { id: true, name: true, slug: true } },
        teacher: { select: { fullName: true } },
      },
      orderBy: {
        enrollments: { _count: "desc" },
      },
      take: 8,
    });

    for (const c of categoryCourses) {
      results.push({
        id: c.id,
        title: c.title,
        thumbnailUrl: c.thumbnailUrl,
        category: c.category,
        teacherName: c.teacher.fullName ?? "",
        enrollmentCount: c._count.enrollments,
      });
    }
  }

  if (results.length < 8) {
    const excludeIds = [...enrolledCourseIds, ...results.map((r) => r.id)];
    const remaining = 8 - results.length;

    const overallCourses = await prisma.course.findMany({
      where: {
        status: "published",
        deletedAt: null,
        id: { notIn: excludeIds },
      },
      include: {
        _count: { select: { enrollments: true } },
        category: { select: { id: true, name: true, slug: true } },
        teacher: { select: { fullName: true } },
      },
      orderBy: {
        enrollments: { _count: "desc" },
      },
      take: remaining,
    });

    for (const c of overallCourses) {
      results.push({
        id: c.id,
        title: c.title,
        thumbnailUrl: c.thumbnailUrl,
        category: c.category,
        teacherName: c.teacher.fullName ?? "",
        enrollmentCount: c._count.enrollments,
      });
    }
  }

  return NextResponse.json(results);
}
