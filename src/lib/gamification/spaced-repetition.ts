import { prisma } from "@/lib/db";

export interface ReviewItem {
  lessonId: string;
  lessonTitle: string;
  courseId: string;
  courseTitle: string;
  skillName: string;
  masteryScore: number;
  daysSinceLastReview: number;
  nextReviewDate: string;
  urgency: "due" | "overdue" | "upcoming";
  interval: number;
}

const REVIEW_INTERVALS = [1, 3, 7, 14, 30, 60];

function getReviewInterval(masteryScore: number, streak: number): number {
  if (masteryScore >= 0.9) return REVIEW_INTERVALS[5];
  if (masteryScore >= 0.8) return REVIEW_INTERVALS[4];
  if (masteryScore >= 0.7) return REVIEW_INTERVALS[3];
  if (masteryScore >= 0.5) return REVIEW_INTERVALS[2];
  if (masteryScore >= 0.3) return REVIEW_INTERVALS[1];
  return REVIEW_INTERVALS[0];
}

function getUrgency(daysSinceReview: number, nextReviewDays: number): ReviewItem["urgency"] {
  if (daysSinceReview > nextReviewDays) return "overdue";
  if (daysSinceReview >= nextReviewDays - 1) return "due";
  return "upcoming";
}

export async function getSpacedRepetitionReviews(userId: string, limit = 10): Promise<ReviewItem[]> {
  const masteryRecords = await prisma.skillMastery.findMany({
    where: { userId, attempts: { gt: 0 } },
    include: { skill: true },
  });

  if (masteryRecords.length === 0) return [];

  const completedLessons = await prisma.lessonProgress.findMany({
    where: { userId, status: "completed" },
    include: {
      lesson: {
        include: {
          module: { select: { courseId: true, course: { select: { title: true } } } },
        },
      },
    },
  });

  const lessonSkillMap = await prisma.lessonSkill.findMany({
    select: { lessonId: true, skillId: true, weight: true },
  });

  const lessonToSkills = new Map<string, { skillId: string; weight: number }[]>();
  for (const ls of lessonSkillMap) {
    const existing = lessonToSkills.get(ls.lessonId) ?? [];
    existing.push({ skillId: ls.skillId, weight: ls.weight });
    lessonToSkills.set(ls.lessonId, existing);
  }

  const reviews: ReviewItem[] = [];

  for (const lesson of completedLessons) {
    const skills = lessonToSkills.get(lesson.lessonId) ?? [];
    if (skills.length === 0) continue;

    for (const skillLink of skills) {
      const mastery = masteryRecords.find((m) => m.skillId === skillLink.skillId);
      if (!mastery) continue;

      const lastReview = mastery.lastAttempt ?? lesson.updatedAt;
      const daysSinceReview = Math.floor((Date.now() - lastReview.getTime()) / (1000 * 60 * 60 * 24));
      const interval = getReviewInterval(mastery.score, mastery.streak);
      const nextReviewDate = new Date(lastReview.getTime() + interval * 24 * 60 * 60 * 1000);
      const urgency = getUrgency(daysSinceReview, interval);

      reviews.push({
        lessonId: lesson.lessonId,
        lessonTitle: lesson.lesson.title,
        courseId: lesson.lesson.module.courseId,
        courseTitle: lesson.lesson.module.course.title,
        skillName: mastery.skill.name,
        masteryScore: Math.round(mastery.score * 100),
        daysSinceLastReview: daysSinceReview,
        nextReviewDate: nextReviewDate.toISOString(),
        urgency,
        interval,
      });
    }
  }

  reviews.sort((a, b) => {
    const urgencyOrder = { overdue: 0, due: 1, upcoming: 2 };
    if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    }
    return a.masteryScore - b.masteryScore;
  });

  return reviews.slice(0, limit);
}

export async function getReviewSummary(userId: string) {
  const reviews = await getSpacedRepetitionReviews(userId, 50);

  const overdue = reviews.filter((r) => r.urgency === "overdue").length;
  const due = reviews.filter((r) => r.urgency === "due").length;
  const upcoming = reviews.filter((r) => r.urgency === "upcoming").length;

  return {
    total: reviews.length,
    overdue,
    due,
    upcoming,
    nextReview: reviews.length > 0 ? reviews[0] : null,
  };
}
