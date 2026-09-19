import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function computeRelevanceScore(text: string, query: string): number {
  if (!text) return 0;
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const terms = lowerQuery.split(/\s+/).filter(Boolean);

  let score = 0;

  // Exact match bonus
  if (lowerText === lowerQuery) score += 50;
  // Starts with query bonus
  else if (lowerText.startsWith(lowerQuery)) score += 30;
  // Contains full query
  else if (lowerText.includes(lowerQuery)) score += 20;

  // Multi-term matching
  for (const term of terms) {
    if (lowerText.includes(term)) score += 10;
    if (lowerText.startsWith(term)) score += 5;
  }

  // Word position bonus (earlier match = higher relevance)
  const firstIndex = lowerText.indexOf(lowerQuery);
  if (firstIndex >= 0) {
    score += Math.max(0, 15 - firstIndex);
  }

  return score;
}

function computeMaxRelevance(texts: string[], query: string): number {
  return Math.max(0, ...texts.map((t) => computeRelevanceScore(t, query)));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const type = searchParams.get("type");

  if (!q || q.length < 2) {
    return NextResponse.json({ courses: [], lessons: [], teachers: [], categories: [], tags: [] });
  }

  const isAll = !type || type === "all";

  const tasks: Promise<unknown>[] = [];
  const keys: string[] = [];

  if (isAll || type === "course") {
    tasks.push(
      prisma.course.findMany({
        where: {
          status: "published",
          deletedAt: null,
          OR: [
            { title: { contains: q } },
            { description: { contains: q } },
            { subject: { contains: q } },
            { tags: { some: { tag: { name: { contains: q } } } } },
          ],
        },
        select: {
          id: true,
          title: true,
          description: true,
          thumbnailUrl: true,
          difficulty: true,
          subject: true,
          teacher: { select: { fullName: true } },
          tags: { select: { tag: { select: { id: true, name: true, slug: true } } } },
          _count: { select: { enrollments: true } },
        },
        take: 50,
      })
    );
    keys.push("courses");
  }

  if (isAll || type === "teacher") {
    tasks.push(
      prisma.profile.findMany({
        where: {
          role: "teacher",
          OR: [
            { fullName: { contains: q } },
            { email: { contains: q } },
            { metadata: { contains: q } },
          ],
        },
        select: { id: true, fullName: true, email: true, metadata: true },
        take: 20,
      })
    );
    keys.push("teachers");
  }

  if (isAll || type === "lesson") {
    tasks.push(
      prisma.lesson.findMany({
        where: {
          status: "published",
          deletedAt: null,
          OR: [
            { title: { contains: q } },
            { description: { contains: q } },
          ],
        },
        select: {
          id: true,
          title: true,
          description: true,
          module: {
            select: {
              title: true,
              course: {
                select: { title: true },
              },
            },
          },
        },
        take: 30,
      })
    );
    keys.push("lessons");
  }

  if (isAll || type === "category") {
    tasks.push(
      prisma.category.findMany({
        where: {
          name: { contains: q },
        },
        select: {
          id: true,
          name: true,
          slug: true,
        },
        take: 15,
      })
    );
    keys.push("categories");
  }

  if (isAll || type === "tag") {
    tasks.push(
      prisma.tag.findMany({
        where: {
          name: { contains: q },
        },
        select: {
          id: true,
          name: true,
          slug: true,
        },
        take: 15,
      })
    );
    keys.push("tags");
  }

  const results = await Promise.all(tasks);

  const response: Record<string, unknown[]> = {
    courses: [],
    lessons: [],
    teachers: [],
    categories: [],
    tags: [],
  };

  for (let i = 0; i < keys.length; i++) {
    response[keys[i]] = results[i] as unknown[];
  }

  if (response.courses.length > 0) {
    const courses = response.courses as Array<{
      title: string;
      description: string | null;
      subject: string | null;
      teacher: { fullName: string | null };
      tags: { tag: { name: string } }[];
      _count: { enrollments: number };
      relevanceScore?: number;
    }>;

    courses.forEach((c) => {
      const titleScore = computeRelevanceScore(c.title, q) * 3;
      const descScore = computeRelevanceScore(c.description ?? "", q) * 1.5;
      const subjectScore = computeRelevanceScore(c.subject ?? "", q) * 2;
      const teacherScore = computeRelevanceScore(c.teacher.fullName ?? "", q) * 1.5;
      const tagScore = Math.max(0, ...c.tags.map((t) => computeRelevanceScore(t.tag.name, q))) * 2;
      const popularityBoost = Math.log2(1 + c._count.enrollments) * 5;

      c.relevanceScore = titleScore + descScore + subjectScore + teacherScore + tagScore + popularityBoost;
    });

    courses.sort((a, b) => (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0));
    response.courses = courses.slice(0, 20) as unknown[];
  }

  if (response.teachers.length > 0) {
    const teachers = response.teachers as Array<{
      fullName: string | null;
      email: string | null;
      metadata: string;
      relevanceScore?: number;
    }>;

    teachers.forEach((t) => {
      const nameScore = computeRelevanceScore(t.fullName ?? "", q) * 3;
      const emailScore = computeRelevanceScore(t.email ?? "", q);
      const metaScore = computeRelevanceScore(t.metadata, q) * 0.5;
      t.relevanceScore = nameScore + emailScore + metaScore;
    });

    teachers.sort((a, b) => (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0));
    response.teachers = teachers.slice(0, 5) as unknown[];
  }

  if (response.lessons.length > 0) {
    const lessons = response.lessons as Array<{
      title: string;
      description: string | null;
      module: { title: string; course: { title: string } };
      relevanceScore?: number;
    }>;

    lessons.forEach((l) => {
      const titleScore = computeRelevanceScore(l.title, q) * 3;
      const descScore = computeRelevanceScore(l.description ?? "", q) * 1.5;
      const moduleScore = computeRelevanceScore(l.module.title, q) * 1;
      const courseScore = computeRelevanceScore(l.module.course.title, q) * 1;
      l.relevanceScore = titleScore + descScore + moduleScore + courseScore;
    });

    lessons.sort((a, b) => (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0));
    response.lessons = lessons.slice(0, 10) as unknown[];
  }

  if (response.categories.length > 0) {
    const categories = response.categories as Array<{
      name: string;
      relevanceScore?: number;
    }>;

    categories.forEach((c) => {
      c.relevanceScore = computeRelevanceScore(c.name, q) * 3;
    });

    categories.sort((a, b) => (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0));
    response.categories = categories.slice(0, 5) as unknown[];
  }

  if (response.tags.length > 0) {
    const tags = response.tags as Array<{
      name: string;
      relevanceScore?: number;
    }>;

    tags.forEach((t) => {
      t.relevanceScore = computeRelevanceScore(t.name, q) * 3;
    });

    tags.sort((a, b) => (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0));
    response.tags = tags.slice(0, 5) as unknown[];
  }

  return NextResponse.json(response);
}
