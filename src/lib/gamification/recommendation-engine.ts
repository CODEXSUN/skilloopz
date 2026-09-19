import { prisma } from "@/lib/db";
import { getNextRecommendation, getMasteryLevel } from "./mastery-engine";

export interface Recommendation {
  type: "review" | "practice" | "advance";
  lesson: {
    id: string;
    title: string;
    courseId: string;
    courseTitle: string;
  };
  reason: string;
  skillName: string;
  masteryScore: number;
}

export async function getRecommendations(userId: string, limit = 5): Promise<Recommendation[]> {
  const masteryRecords = await prisma.skillMastery.findMany({
    where: { userId },
    include: { skill: true },
    orderBy: { score: "asc" },
  });

  if (masteryRecords.length === 0) {
    return getBeginnerRecommendations(userId, limit);
  }

  const recommendations: Recommendation[] = [];

  for (const record of masteryRecords) {
    const score = record.score;
    const action = getNextRecommendation(score, true);

    const lessons = await findLessonsForSkill(record.skillId, action, userId);

    for (const lesson of lessons.slice(0, 2)) {
      if (recommendations.length >= limit) break;

      recommendations.push({
        type: action,
        lesson: {
          id: lesson.id,
          title: lesson.title,
          courseId: lesson.module.courseId,
          courseTitle: "",
        },
        reason: getRecommendationReason(action, record.skill.name, score),
        skillName: record.skill.name,
        masteryScore: Math.round(score * 100),
      });
    }

    if (recommendations.length >= limit) break;
  }

  for (const rec of recommendations) {
    const course = await prisma.course.findUnique({
      where: { id: rec.lesson.courseId },
      select: { title: true },
    });
    if (course) {
      rec.lesson.courseTitle = course.title;
    }
  }

  return recommendations;
}

async function findLessonsForSkill(
  skillId: string,
  action: "review" | "practice" | "advance",
  userId: string,
) {
  const lessonSkills = await prisma.lessonSkill.findMany({
    where: { skillId },
    include: {
      lesson: {
        include: {
          module: { select: { courseId: true } },
        },
      },
    },
  });

  const completedLessons = await prisma.lessonProgress.findMany({
    where: { userId, status: "completed" },
    select: { lessonId: true },
  });

  const completedIds = new Set(completedLessons.map((lp) => lp.lessonId));

  if (action === "review") {
    return lessonSkills
      .filter((ls) => completedIds.has(ls.lesson.id))
      .map((ls) => ls.lesson);
  }

  if (action === "practice") {
    return lessonSkills
      .filter((ls) => !completedIds.has(ls.lesson.id))
      .slice(0, 3)
      .map((ls) => ls.lesson);
  }

  const allLessons = lessonSkills.map((ls) => ls.lesson);
  return allLessons.slice(0, 3);
}

function getRecommendationReason(
  action: string,
  skillName: string,
  score: number,
): string {
  switch (action) {
    case "review":
      return `Your ${skillName} score is ${Math.round(score * 100)}%. Review to strengthen foundations.`;
    case "practice":
      return `Practice ${skillName} to reach the next mastery level.`;
    case "advance":
      return `You're proficient in ${skillName}. Ready for new challenges.`;
    default:
      return `Continue building your ${skillName} skills.`;
  }
}

async function getBeginnerRecommendations(userId: string, limit: number): Promise<Recommendation[]> {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId, completed: false },
    include: {
      course: {
        include: {
          modules: {
            include: {
              lessons: {
                take: 3,
              },
            },
          },
        },
      },
    },
    take: 2,
  });

  const recommendations: Recommendation[] = [];

  for (const enrollment of enrollments) {
    for (const module of enrollment.course.modules) {
      for (const lesson of module.lessons) {
        if (recommendations.length >= limit) break;

        recommendations.push({
          type: "practice",
          lesson: {
            id: lesson.id,
            title: lesson.title,
            courseId: enrollment.courseId,
            courseTitle: enrollment.course.title,
          },
          reason: `Start learning ${enrollment.course.title}`,
          skillName: "General",
          masteryScore: 0,
        });
      }
    }
  }

  return recommendations;
}
