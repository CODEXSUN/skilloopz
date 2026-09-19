import { prisma } from "@/lib/db";
import { XP_REWARDS, getLevelInfo } from "@/lib/gamification/xp-calculator";

export async function awardCourseCompletion(userId: string, courseId: string) {
  return await prisma.$transaction(async (tx: any) => {
    const alreadyAwarded = await tx.xPTransaction.findFirst({
      where: { userId, reason: "course_completed", referenceId: courseId },
    });

    if (alreadyAwarded) return { xpAwarded: 0, alreadyCompleted: true, certificateId: null };

    await tx.xPTransaction.create({
      data: {
        userId,
        amount: XP_REWARDS.LESSON_COMPLETE * 2,
        reason: "course_completed",
        referenceId: courseId,
      },
    });

    const profile = await tx.profile.findUnique({ where: { id: userId } });
    const newXp = (profile?.xp ?? 0) + XP_REWARDS.LESSON_COMPLETE * 2;
    const levelInfo = getLevelInfo(newXp);

    await tx.profile.update({
      where: { id: userId },
      data: {
        xp: newXp,
        level: levelInfo.level,
      },
    });

    const serial = generateSerial();
    const certificate = await tx.certificate.create({
      data: { userId, courseId, serial },
    });

    const course = await tx.course.findUnique({
      where: { id: courseId },
      select: { title: true },
    });

    await tx.notification.create({
      data: {
        userId,
        type: "course_complete",
        title: "Course Completed! 🎓",
        message: `You completed "${course?.title ?? "the course"}" and earned a certificate.`,
        link: `/courses/${courseId}/certificate`,
      },
    });

    return {
      xpAwarded: XP_REWARDS.LESSON_COMPLETE * 2,
      alreadyCompleted: false,
      certificateId: certificate.id,
    };
  });
}

function generateSerial(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `NEOT-${ts}-${rand}`;
}
