import { prisma } from "@/lib/db";
import { calculateEnrollmentProgress, isCourseComplete } from "./calculate-progress";

export async function recalculateEnrollmentProgress(userId: string, courseId: string) {
  const totalLessons = await prisma.lesson.count({
    where: { module: { courseId }, status: "published" },
  });

  const completedLessons = await prisma.lessonProgress.count({
    where: {
      userId,
      lesson: { module: { courseId } },
      status: "completed",
    },
  });

  const progress = calculateEnrollmentProgress(completedLessons, totalLessons);
  const completed = isCourseComplete(completedLessons, totalLessons);

  return prisma.enrollment.updateMany({
    where: { userId, courseId },
    data: {
      progress,
      completed,
      ...(completed ? { completedAt: new Date() } : {}),
    },
  });
}
