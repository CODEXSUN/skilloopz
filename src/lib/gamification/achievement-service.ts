import { prisma } from "@/lib/db";

export interface NewAchievement {
  id: string;
  name: string;
  description: string;
  xpReward: number;
}

const ACHIEVEMENT_SEEDS: { id: string; name: string; description: string; xpReward: number; criteria: string }[] = [
  { id: "first_lesson", name: "First Steps", description: "Complete your first lesson", xpReward: 50, criteria: '{"type":"lessons_completed","value":1}' },
  { id: "ten_lessons", name: "Dedicated Learner", description: "Complete 10 lessons", xpReward: 200, criteria: '{"type":"lessons_completed","value":10}' },
  { id: "fifty_lessons", name: "Knowledge Seeker", description: "Complete 50 lessons", xpReward: 500, criteria: '{"type":"lessons_completed","value":50}' },
  { id: "hundred_lessons", name: "Century Scholar", description: "Complete 100 lessons", xpReward: 1000, criteria: '{"type":"lessons_completed","value":100}' },
  { id: "seven_day_streak", name: "Week Warrior", description: "Maintain a 7-day streak", xpReward: 150, criteria: '{"type":"longest_streak","value":7}' },
  { id: "thirty_day_streak", name: "Monthly Master", description: "Maintain a 30-day streak", xpReward: 500, criteria: '{"type":"longest_streak","value":30}' },
  { id: "perfect_quiz", name: "Perfect Score", description: "Get 100% on a quiz", xpReward: 100, criteria: '{"type":"perfect_quiz","value":1}' },
  { id: "first_course", name: "Course Complete", description: "Complete your first course", xpReward: 300, criteria: '{"type":"courses_completed","value":1}' },
  { id: "five_courses", name: "Course Collector", description: "Complete 5 courses", xpReward: 1000, criteria: '{"type":"courses_completed","value":5}' },
];

export async function ensureAchievementsSeeded(): Promise<void> {
  await prisma.$transaction(async (tx: any) => {
    for (const a of ACHIEVEMENT_SEEDS) {
      await tx.achievement.upsert({
        where: { id: a.id },
        update: { name: a.name, description: a.description, xpReward: a.xpReward, criteria: a.criteria },
        create: a,
      });
    }
  });
}

export async function checkAndAwardAchievements(
  userId: string,
  tx: any,
): Promise<NewAchievement[]> {
  for (const a of ACHIEVEMENT_SEEDS) {
    await tx.achievement.upsert({
      where: { id: a.id },
      update: { name: a.name, description: a.description, xpReward: a.xpReward, criteria: a.criteria },
      create: a,
    });
  }

  const profile = await tx.profile.findUnique({ where: { id: userId } });

  const [completedLessons, completedCourses, perfectQuizzes, earned] = await Promise.all([
    tx.lessonProgress.count({ where: { userId, status: "completed" } }),
    tx.enrollment.count({ where: { userId, completed: true } }),
    tx.lessonProgress.count({ where: { userId, score: 100 } }),
    tx.userAchievement.findMany({ where: { userId }, select: { achievementId: true } }),
  ]);

  const earnedIds = new Set(earned.map((e: { achievementId: string }) => e.achievementId));
  const newlyUnlocked: NewAchievement[] = [];

  const checks: { id: string; condition: boolean }[] = [
    { id: "first_lesson", condition: completedLessons >= 1 },
    { id: "ten_lessons", condition: completedLessons >= 10 },
    { id: "fifty_lessons", condition: completedLessons >= 50 },
    { id: "hundred_lessons", condition: completedLessons >= 100 },
    { id: "seven_day_streak", condition: (profile?.longestStreak ?? 0) >= 7 },
    { id: "thirty_day_streak", condition: (profile?.longestStreak ?? 0) >= 30 },
    { id: "perfect_quiz", condition: perfectQuizzes >= 1 },
    { id: "first_course", condition: completedCourses >= 1 },
    { id: "five_courses", condition: completedCourses >= 5 },
  ];

  for (const check of checks) {
    if (check.condition && !earnedIds.has(check.id)) {
      const achievement = await tx.achievement.findUnique({ where: { id: check.id } });
      if (achievement) {
        await tx.userAchievement.create({
          data: { userId, achievementId: check.id },
        });
        if (achievement.xpReward > 0) {
          await tx.xPTransaction.create({
            data: {
              userId,
              amount: achievement.xpReward,
              reason: "achievement",
              referenceId: check.id,
            },
          });
          await tx.profile.update({
            where: { id: userId },
            data: { xp: { increment: achievement.xpReward } },
          });
        }
        await tx.notification.create({
          data: {
            userId,
            type: "achievement",
            title: achievement.name,
            message: `${achievement.description} — +${achievement.xpReward} XP`,
            link: "/dashboard/achievements",
          },
        });
        newlyUnlocked.push({
          id: achievement.id,
          name: achievement.name,
          description: achievement.description,
          xpReward: achievement.xpReward,
        });
      }
    }
  }

  return newlyUnlocked;
}
