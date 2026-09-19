import { prisma } from "@/lib/db";

export const NOTIFICATION_TYPES = {
  INFO: "info",
  XP_GAINED: "xp_gained",
  ACHIEVEMENT_UNLOCKED: "achievement_unlocked",
  LEVEL_UP: "level_up",
  QUIZ_RESULT: "quiz_result",
  STREAK_MILESTONE: "streak_milestone",
  COURSE_PUBLISHED: "course_published",
  COURSE_COMPLETED: "course_completed",
  MESSAGE: "message",
  GRADING_ALERT: "grading_alert",
  STREAK_REMINDER: "streak_reminder",
  NEW_USER: "new_user",
  COURSE_SUBMITTED: "course_submitted",
  REPORT_FLAGGED: "report_flagged",
  PLATFORM_ALERT: "platform_alert",
  SYSTEM_ALERT: "system_alert",
} as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  link?: string,
) {
  return prisma.notification.create({
    data: { userId, type, title, message, link },
  });
}

export async function getUserNotifications(userId: string, limit = 20) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getUnreadCount(userId: string) {
  return prisma.notification.count({
    where: { userId, readAt: null },
  });
}

export async function markNotificationRead(id: string, userId: string) {
  return prisma.notification.updateMany({
    where: { id, userId },
    data: { readAt: new Date() },
  });
}

export async function markAllNotificationsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
}

export async function sendTeacherMessage(
  teacherId: string,
  studentIds: string[],
  subject: string,
  body: string,
  courseId?: string,
) {
  const notifications = studentIds.map((studentId) => ({
    userId: studentId,
    type: NOTIFICATION_TYPES.MESSAGE,
    title: `Message from teacher`,
    message: subject,
    link: courseId ? `/courses/${courseId}` : "/dashboard",
  }));

  return prisma.notification.createMany({
    data: notifications,
  });
}

export async function sendGradingAlert(
  studentId: string,
  assignmentTitle: string,
  score: number,
  courseId: string,
) {
  return createNotification(
    studentId,
    NOTIFICATION_TYPES.GRADING_ALERT,
    "Assignment graded",
    `Your "${assignmentTitle}" has been graded. Score: ${score}%`,
    `/courses/${courseId}`,
  );
}

export async function sendStreakReminder(userId: string, currentStreak: number) {
  return createNotification(
    userId,
    NOTIFICATION_TYPES.STREAK_REMINDER,
    "Streak at risk!",
    `Your ${currentStreak}-day streak needs attention. Complete a lesson today to keep it going!`,
    "/dashboard",
  );
}

export async function deleteNotification(id: string, userId: string) {
  return prisma.notification.deleteMany({
    where: { id, userId },
  });
}

export async function deleteOldNotifications(olderThanDays = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

  return prisma.notification.deleteMany({
    where: {
      createdAt: { lt: cutoffDate },
      readAt: { not: null },
    },
  });
}

export async function notifyAdmins(
  type: NotificationType,
  title: string,
  message: string,
  link?: string,
) {
  const admins = await prisma.profile.findMany({
    where: { role: "admin" },
    select: { id: true },
  });

  if (admins.length === 0) return { count: 0 };

  const notifications = admins.map((admin) => ({
    userId: admin.id,
    type,
    title,
    message,
    link: link ?? "/admin",
  }));

  return prisma.notification.createMany({ data: notifications });
}

export async function notifyNewUser(userId: string, fullName: string | null, role: string) {
  return notifyAdmins(
    NOTIFICATION_TYPES.NEW_USER,
    "New user registered",
    `${fullName ?? "A new user"} signed up as ${role}`,
    `/admin/users`,
  );
}

export async function notifyCourseSubmitted(courseId: string, title: string, teacherName: string | null) {
  return notifyAdmins(
    NOTIFICATION_TYPES.COURSE_SUBMITTED,
    "Course submitted for review",
    `${teacherName ?? "A teacher"} submitted "${title}" for review`,
    `/admin/courses`,
  );
}

export async function notifyReportFlagged(reportId: string, reason: string, reporterName: string | null) {
  return notifyAdmins(
    NOTIFICATION_TYPES.REPORT_FLAGGED,
    "Content flagged",
    `${reporterName ?? "A user"} flagged content: ${reason}`,
    `/admin/moderation`,
  );
}

export async function notifyPlatformAlert(title: string, message: string, link?: string) {
  return notifyAdmins(
    NOTIFICATION_TYPES.PLATFORM_ALERT,
    title,
    message,
    link,
  );
}
