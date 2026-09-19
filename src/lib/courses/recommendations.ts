import { prisma } from "@/lib/db";

export async function getRecommendations(userId: string, limit = 4) {
  const enrolled = await prisma.enrollment.findMany({
    where: { userId, course: { deletedAt: null } },
    select: { courseId: true },
  });
  const enrolledIds = new Set(enrolled.map((e) => e.courseId));

  const profile = await prisma.profile.findUnique({
    where: { id: userId },
    select: { metadata: true },
  });

  const interests: string[] = (() => {
    try {
      const meta = JSON.parse(profile?.metadata ?? "{}");
      return Array.isArray(meta.interests) ? meta.interests : [];
    } catch {
      return [];
    }
  })();

  const userEnrollments = await prisma.enrollment.findMany({
    where: { userId, archived: false, course: { deletedAt: null } },
    include: { course: { select: { categoryId: true } } },
  });

  const categoryCounts = new Map<string, number>();
  for (const e of userEnrollments) {
    if (e.course.categoryId) {
      categoryCounts.set(e.course.categoryId, (categoryCounts.get(e.course.categoryId) ?? 0) + 1);
    }
  }

  let topCategory: string | null = null;
  let maxCount = 0;
  for (const [catId, count] of categoryCounts) {
    if (count > maxCount) {
      maxCount = count;
      topCategory = catId;
    }
  }

  const whereBase = {
    status: "published" as const,
    deletedAt: null,
    id: { notIn: Array.from(enrolledIds) },
  };

  const allCandidates = await prisma.course.findMany({
    where: whereBase,
    include: {
      category: true,
      teacher: { select: { fullName: true } },
      tags: { select: { tag: { select: { name: true } } } },
      _count: { select: { enrollments: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const scored = allCandidates.map((course) => {
    let score = 0;

    if (topCategory && course.categoryId === topCategory) score += 10;

    const courseTags = course.tags.map((t) => t.tag.name.toLowerCase());
    const interestMatches = interests.filter((i) =>
      courseTags.some((t) => t.includes(i.toLowerCase())) ||
      course.title.toLowerCase().includes(i.toLowerCase()) ||
      (course.subject?.toLowerCase().includes(i.toLowerCase()) ?? false),
    );
    score += interestMatches.length * 5;

    const enrollCount = course._count.enrollments;
    score += Math.min(enrollCount, 20) * 0.5;

    const ageDays = (Date.now() - course.createdAt.getTime()) / 86400000;
    score += Math.max(0, 5 - ageDays / 30);

    return { course, score };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((s) => s.course);
}
