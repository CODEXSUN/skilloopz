import { prisma } from "@/lib/db";

export async function updateContinueLearning(userId: string, courseId: string, lessonId: string) {
  await prisma.enrollment.updateMany({
    where: { userId, courseId },
    data: {
      lastLessonId: lessonId,
      lastAccessedAt: new Date(),
    },
  });
}
