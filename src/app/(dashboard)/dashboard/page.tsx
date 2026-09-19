import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { getLevelInfo } from "@/lib/gamification/xp-calculator";
import { getLevelTitle } from "@/lib/gamification/level-system";
import { getRecommendations as getCourseRecommendations } from "@/lib/courses/recommendations";
import { getRecommendations as getAdaptiveRecommendations } from "@/lib/gamification/recommendation-engine";
import { getActiveEventsForUser } from "@/lib/gamification/seasonal-event-service";

export default async function DashboardPage() {
  const user = await getUser();
  const name = user?.email ? user.email.split("@")[0] : "there";

  let stats = { courses: 0, lessons: 0, xp: 0, streak: 0, level: 1, levelTitle: "Beginner", levelProgress: 0, certificates: 0, timeSpent: 0 };
  let enrollments: {
    id: string;
    progress: number;
    course: {
      id: string;
      title: string;
      description: string | null;
      thumbnailUrl: string | null;
      difficulty: string;
      estimatedMinutes: number | null;
      category: { name: string } | null;
    };
  }[] = [];
  let continueLesson: {
    id: string;
    title: string;
    courseId: string;
    courseTitle: string;
    estimatedMinutes: number | null;
  } | null = null;

  let recommendations: {
    id: string;
    title: string;
    description: string | null;
    thumbnailUrl: string | null;
    difficulty: string;
    category: { name: string } | null;
    teacher: { fullName: string | null } | null;
  }[] = [];

  let seasonalEvents: Awaited<ReturnType<typeof getActiveEventsForUser>> = [];
  let recentActivity: { id: string; lessonTitle: string; courseTitle: string; status: string; score: number | null; createdAt: string }[] = [];
  let weeklyGoal: { target: number; completed: number; xpThisWeek: number } = { target: 5, completed: 0, xpThisWeek: 0 };

  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [profile, courseCount, lessonCount, enrolled, lastProgress, certCount, recs, adaptiveRecs, timeAgg, events, activity, xpThisWeek] = await Promise.all([
      prisma.profile.findUnique({
        where: { id: user!.id },
        select: { xp: true, level: true, currentStreak: true },
      }),
      prisma.enrollment.count({ where: { userId: user!.id, archived: false, course: { deletedAt: null } } }),
      prisma.lessonProgress.count({ where: { userId: user!.id, status: "completed" } }),
      prisma.enrollment.findMany({
        where: { userId: user!.id, archived: false, course: { deletedAt: null } },
        include: {
          course: { include: { category: true } },
        },
        orderBy: { updatedAt: "desc" },
        take: 6,
      }),
      prisma.enrollment.findFirst({
        where: { userId: user!.id, lastLessonId: { not: null }, course: { deletedAt: null } },
        orderBy: { lastAccessedAt: "desc" },
        select: {
          lastLessonId: true,
          courseId: true,
          course: { select: { title: true } },
        },
      }),
      prisma.certificate.count({ where: { userId: user!.id } }),
      getCourseRecommendations(user!.id),
      getAdaptiveRecommendations(user!.id, 3),
      prisma.lessonProgress.aggregate({
        where: { userId: user!.id },
        _sum: { timeSpent: true },
      }),
      getActiveEventsForUser(user!.id),
      prisma.lessonProgress.findMany({
        where: { userId: user!.id },
        orderBy: { updatedAt: "desc" },
        take: 10,
        include: {
          lesson: {
            select: {
              title: true,
              module: { select: { course: { select: { title: true } } } },
            },
          },
        },
      }),
      prisma.xPTransaction.aggregate({
        where: { userId: user!.id, createdAt: { gte: sevenDaysAgo } },
        _sum: { amount: true },
      }),
    ]);
    recommendations = recs;
    seasonalEvents = events;

    if (adaptiveRecs.length > 0) {
      const adaptiveCourseRecs = adaptiveRecs.map((r) => ({
        id: r.lesson.courseId,
        title: r.lesson.courseTitle,
        description: `${r.type === "review" ? "Review" : r.type === "practice" ? "Practice" : "Advance in"} ${r.skillName}`,
        thumbnailUrl: null as string | null,
        difficulty: "beginner" as string,
        category: null as { name: string } | null,
        teacher: null as { fullName: string | null } | null,
      }));
      recommendations = [...adaptiveCourseRecs, ...recs].slice(0, 6);
    }
    recentActivity = activity.map((a) => ({
      id: a.id,
      lessonTitle: a.lesson.title,
      courseTitle: a.lesson.module.course.title,
      status: a.status,
      score: a.score,
      createdAt: a.updatedAt.toISOString(),
    }));
    weeklyGoal = {
      target: 5,
      completed: lessonCount,
      xpThisWeek: xpThisWeek._sum.amount ?? 0,
    };

    const xp = profile?.xp ?? 0;
    const level = profile?.level ?? 1;
    const levelInfo = getLevelInfo(xp);

    stats = {
      courses: courseCount,
      lessons: lessonCount,
      xp,
      streak: profile?.currentStreak ?? 0,
      level,
      levelTitle: getLevelTitle(level),
      levelProgress: levelInfo.progress,
      certificates: certCount,
      timeSpent: timeAgg._sum.timeSpent ?? 0,
    };
    enrollments = enrolled;

    if (lastProgress?.lastLessonId) {
      const lesson = await prisma.lesson.findUnique({
        where: { id: lastProgress.lastLessonId },
        select: { id: true, title: true, estimatedMinutes: true },
      });
      if (lesson) {
        continueLesson = {
          id: lesson.id,
          title: lesson.title,
          courseId: lastProgress.courseId,
          courseTitle: lastProgress.course.title,
          estimatedMinutes: lesson.estimatedMinutes,
        };
      }
    }
  } catch {
    // Dashboard data not available
  }

  return <DashboardContent name={name} stats={stats} enrollments={enrollments} continueLesson={continueLesson} recommendations={recommendations} seasonalEvents={seasonalEvents} recentActivity={recentActivity} weeklyGoal={weeklyGoal} />;
}
