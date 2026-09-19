import { prisma } from '@/lib/db';
import {
  calculateMasteryScore,
  adjustDifficulty,
  getMasteryLevel,
  getTrend,
  type MasteryUpdate,
} from './mastery-engine';

export async function updateSkillMastery(
  userId: string,
  skillId: string,
  update: MasteryUpdate,
) {
  const existing = await prisma.skillMastery.findUnique({
    where: { userId_skillId: { userId, skillId } },
  });

  const now = new Date();
  const attempts = (existing?.attempts ?? 0) + 1;
  const correct = (existing?.correct ?? 0) + (update.correct ? 1 : 0);
  const streak = update.correct
    ? (existing?.streak ?? 0) + 1
    : 0;

  const daysSinceLast = existing?.lastAttempt
    ? (now.getTime() - new Date(existing.lastAttempt).getTime()) / (1000 * 60 * 60 * 24)
    : undefined;

  const score = calculateMasteryScore(attempts, correct, streak, daysSinceLast);
  const difficulty = adjustDifficulty(existing?.difficulty ?? 1, score);

  return prisma.skillMastery.upsert({
    where: { userId_skillId: { userId, skillId } },
    create: {
      userId,
      skillId,
      score,
      attempts,
      correct,
      lastAttempt: now,
      difficulty,
      streak,
    },
    update: {
      score,
      attempts,
      correct,
      lastAttempt: now,
      difficulty,
      streak,
    },
  });
}

export async function updateLessonMastery(
  userId: string,
  lessonId: string,
  quizScore: number,
) {
  const lessonSkills = await prisma.lessonSkill.findMany({
    where: { lessonId },
    include: { skill: true },
  });

  if (lessonSkills.length === 0) return [];

  const results = [];
  for (const ls of lessonSkills) {
    const weightedScore = quizScore * ls.weight;
    const correct = weightedScore >= 0.6;

    const mastery = await updateSkillMastery(userId, ls.skillId, {
      correct,
      difficulty: Math.round(quizScore * 5),
    });

    results.push({
      skill: ls.skill.name,
      mastery,
    });
  }

  return results;
}

export async function getUserMasteryOverview(userId: string) {
  const masteryRecords = await prisma.skillMastery.findMany({
    where: { userId },
    include: { skill: true },
    orderBy: [{ score: 'desc' }],
  });

  const byCategory: Record<string, { skills: typeof masteryRecords; avgScore: number }> = {};

  for (const record of masteryRecords) {
    const cat = record.skill.category;
    if (!byCategory[cat]) {
      byCategory[cat] = { skills: [], avgScore: 0 };
    }
    byCategory[cat].skills.push(record);
  }

  for (const cat of Object.keys(byCategory)) {
    const skills = byCategory[cat].skills;
    byCategory[cat].avgScore = skills.reduce((sum, s) => sum + s.score, 0) / skills.length;
  }

  const totalSkills = masteryRecords.length;
  const masteredCount = masteryRecords.filter((r) => r.score >= 0.75).length;
  const avgScore = totalSkills > 0
    ? masteryRecords.reduce((sum, r) => sum + r.score, 0) / totalSkills
    : 0;

  return {
    skills: masteryRecords,
    byCategory,
    totalSkills,
    masteredCount,
    avgScore,
    masteryPercentage: totalSkills > 0 ? (masteredCount / totalSkills) * 100 : 0,
  };
}

export async function getSkillTrend(userId: string, skillId: string) {
  const mastery = await prisma.skillMastery.findUnique({
    where: { userId_skillId: { userId, skillId } },
    include: { skill: true },
  });

  if (!mastery) return null;

  const xpHistory = await prisma.xPTransaction.findMany({
    where: {
      userId,
      lessonId: { not: null },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  const scores = xpHistory.map((t) => t.amount / 100).reverse();
  const trend = getTrend(scores);

  return {
    skill: mastery.skill,
    score: mastery.score,
    attempts: mastery.attempts,
    streak: mastery.streak,
    difficulty: mastery.difficulty,
    trend,
    lastAttempt: mastery.lastAttempt,
  };
}

export async function getWeakAreas(userId: string, threshold = 0.4) {
  const weakSkills = await prisma.skillMastery.findMany({
    where: {
      userId,
      score: { lt: threshold },
    },
    include: { skill: true },
    orderBy: { score: 'asc' },
  });

  return weakSkills;
}

export async function getStrongAreas(userId: string, threshold = 0.75) {
  const strongSkills = await prisma.skillMastery.findMany({
    where: {
      userId,
      score: { gte: threshold },
    },
    include: { skill: true },
    orderBy: { score: 'desc' },
  });

  return strongSkills;
}
