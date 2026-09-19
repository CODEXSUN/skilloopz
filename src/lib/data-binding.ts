import { prisma } from "@/lib/db";

export type DataSourceType =
  | "courses"
  | "users"
  | "categories"
  | "enrollments"
  | "lessons"
  | "analytics";

export type DataSource = {
  type: DataSourceType;
  filters?: Record<string, unknown>;
  limit?: number;
};

type AggregateResult = {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
};

export async function resolveDataSource(source: DataSource): Promise<unknown[]> {
  const { type, filters = {}, limit } = source;

  switch (type) {
    case "courses": {
      const where: Record<string, unknown> = {};
      if (filters.status) where.status = filters.status;
      const courses = await prisma.course.findMany({
        where,
        take: limit,
        orderBy: { createdAt: "desc" },
      });
      return courses;
    }

    case "users": {
      const where: Record<string, unknown> = {};
      if (filters.role) where.role = filters.role;
      const users = await prisma.profile.findMany({
        where,
        take: limit,
        orderBy: { createdAt: "desc" },
      });
      return users;
    }

    case "categories": {
      const categories = await prisma.category.findMany({
        take: limit,
        orderBy: { sortOrder: "asc" },
      });
      return categories;
    }

    case "enrollments": {
      const where: Record<string, unknown> = {};
      if (filters.userId) where.userId = filters.userId;
      const enrollments = await prisma.enrollment.findMany({
        where,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          course: { select: { title: true } },
          user: { select: { fullName: true, email: true } },
        },
      });
      return enrollments;
    }

    case "lessons": {
      const where: Record<string, unknown> = {};
      if (filters.status) where.status = filters.status;
      const lessons = await prisma.lesson.findMany({
        where,
        take: limit,
        orderBy: { sortOrder: "asc" },
        include: {
          module: { select: { title: true, courseId: true } },
        },
      });
      return lessons;
    }

    case "analytics": {
      const [totalUsers, totalCourses, totalEnrollments] = await Promise.all([
        prisma.profile.count(),
        prisma.course.count(),
        prisma.enrollment.count(),
      ]);
      return [{ totalUsers, totalCourses, totalEnrollments } as AggregateResult];
    }

    default:
      return [];
  }
}
