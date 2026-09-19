export interface MasteryResult {
  score: number;
  difficulty: number;
  streak: number;
  trend: 'improving' | 'stable' | 'declining';
  masteryLevel: 'novice' | 'learning' | 'proficient' | 'master' | 'expert';
}

export interface MasteryUpdate {
  correct: boolean;
  difficulty: number;
  timeSpent?: number;
  hintsUsed?: number;
}

const MASTERY_DECAY_DAYS = 30;
const MASTERY_DECAY_FACTOR = 0.05;
const RECENCY_WEIGHT = 0.3;
const PERFORMANCE_WEIGHT = 0.5;
const CONSISTENCY_WEIGHT = 0.2;

export function calculateMasteryScore(
  attempts: number,
  correct: number,
  streak: number,
  daysSinceLastAttempt?: number,
): number {
  if (attempts === 0) return 0;

  const performanceScore = correct / attempts;

  const streakBonus = Math.min(streak * 0.02, 0.2);

  const recencyPenalty = daysSinceLastAttempt !== undefined
    ? Math.min((daysSinceLastAttempt / MASTERY_DECAY_DAYS) * MASTERY_DECAY_FACTOR, 0.3)
    : 0;

  let score = (performanceScore * (1 + streakBonus)) - recencyPenalty;
  return Math.max(0, Math.min(1, score));
}

export function adjustDifficulty(currentDifficulty: number, masteryScore: number): number {
  if (masteryScore >= 0.85) return Math.min(currentDifficulty + 1, 5);
  if (masteryScore >= 0.7) return currentDifficulty;
  if (masteryScore < 0.4) return Math.max(currentDifficulty - 1, 1);
  return currentDifficulty;
}

export function getMasteryLevel(score: number): MasteryResult['masteryLevel'] {
  if (score >= 0.9) return 'expert';
  if (score >= 0.75) return 'master';
  if (score >= 0.55) return 'proficient';
  if (score >= 0.3) return 'learning';
  return 'novice';
}

export function getMasteryColor(level: MasteryResult['masteryLevel']): string {
  const colors: Record<MasteryResult['masteryLevel'], string> = {
    novice: '#94a3b8',
    learning: '#f59e0b',
    proficient: '#3b82f6',
    master: '#8b5cf6',
    expert: '#10b981',
  };
  return colors[level];
}

export function getTrend(
  recentScores: number[],
): MasteryResult['trend'] {
  if (recentScores.length < 2) return 'stable';

  const half = Math.floor(recentScores.length / 2);
  const firstHalf = recentScores.slice(0, half);
  const secondHalf = recentScores.slice(half);

  const avg1 = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const avg2 = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

  const diff = avg2 - avg1;
  if (diff > 0.05) return 'improving';
  if (diff < -0.05) return 'declining';
  return 'stable';
}

export function getNextRecommendation(
  masteryScore: number,
  hasPrerequisites: boolean,
): 'review' | 'practice' | 'advance' {
  if (masteryScore < 0.4) return 'review';
  if (masteryScore < 0.7) return 'practice';
  if (hasPrerequisites) return 'advance';
  return 'practice';
}
