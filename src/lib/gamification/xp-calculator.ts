export const XP_REWARDS = {
  LESSON_COMPLETE: 100,
  QUIZ_PASS: 50,
  DAILY_STREAK: 25,
} as const;

export const XP_MULTIPLIERS = {
  difficulty: {
    beginner: 1.0,
    intermediate: 1.25,
    advanced: 1.5,
    expert: 2.0,
  },
  firstTryBonus: 1.25,
  streakBonus: {
    3: 1.1,
    7: 1.2,
    14: 1.3,
    30: 1.5,
    50: 1.75,
    100: 2.0,
  },
  perfectQuizBonus: 1.5,
  speedBonus: 1.1,
} as const;

export interface XPCalculationOptions {
  difficulty?: "beginner" | "intermediate" | "advanced" | "expert";
  isFirstTry?: boolean;
  streak?: number;
  isPerfectQuiz?: boolean;
  isSpeedCompletion?: boolean;
  timeSpent?: number;
  estimatedMinutes?: number;
}

export interface XPCalculationResult {
  baseXp: number;
  multipliers: { name: string; multiplier: number }[];
  totalXp: number;
  breakdown: string;
}

export function calculateXP(baseXp: number, options: XPCalculationOptions = {}): XPCalculationResult {
  const multipliers: { name: string; multiplier: number }[] = [];
  let totalXp = baseXp;

  const difficulty = options.difficulty ?? "beginner";
  const diffMult = XP_MULTIPLIERS.difficulty[difficulty];
  if (diffMult !== 1.0) {
    multipliers.push({ name: `Difficulty (${difficulty})`, multiplier: diffMult });
    totalXp *= diffMult;
  }

  if (options.isFirstTry) {
    multipliers.push({ name: "First try bonus", multiplier: XP_MULTIPLIERS.firstTryBonus });
    totalXp *= XP_MULTIPLIERS.firstTryBonus;
  }

  if (options.streak && options.streak > 0) {
    const streakThresholds = Object.entries(XP_MULTIPLIERS.streakBonus)
      .map(([k, v]) => ({ threshold: parseInt(k), multiplier: v }))
      .sort((a, b) => a.threshold - b.threshold);

    let bestStreakMult = 1.0;
    for (const { threshold, multiplier } of streakThresholds) {
      if (options.streak >= threshold) {
        bestStreakMult = multiplier;
      }
    }

    if (bestStreakMult > 1.0) {
      multipliers.push({ name: `Streak bonus (${options.streak} days)`, multiplier: bestStreakMult });
      totalXp *= bestStreakMult;
    }
  }

  if (options.isPerfectQuiz) {
    multipliers.push({ name: "Perfect quiz bonus", multiplier: XP_MULTIPLIERS.perfectQuizBonus });
    totalXp *= XP_MULTIPLIERS.perfectQuizBonus;
  }

  if (options.isSpeedCompletion) {
    multipliers.push({ name: "Speed bonus", multiplier: XP_MULTIPLIERS.speedBonus });
    totalXp *= XP_MULTIPLIERS.speedBonus;
  }

  const roundedXp = Math.round(totalXp);
  const breakdown = multipliers.length > 0
    ? `${baseXp} × ${multipliers.map((m) => `${m.multiplier}x (${m.name})`).join(" × ")}`
    : `${baseXp} (base)`;

  return {
    baseXp,
    multipliers,
    totalXp: roundedXp,
    breakdown,
  };
}

const LEVEL_THRESHOLDS: { level: number; xp: number; title: string }[] = [
  { level: 1, xp: 0, title: "Beginner" },
  { level: 2, xp: 100, title: "Curious Mind" },
  { level: 3, xp: 250, title: "Eager Learner" },
  { level: 4, xp: 500, title: "Knowledge Seeker" },
  { level: 5, xp: 1000, title: "Rising Scholar" },
  { level: 6, xp: 2000, title: "Dedicated Student" },
  { level: 7, xp: 3500, title: "Keen Explorer" },
  { level: 8, xp: 5000, title: "Bright Thinker" },
  { level: 9, xp: 7500, title: "Sharp Analyst" },
  { level: 10, xp: 10000, title: "Scholar" },
  { level: 12, xp: 15000, title: "Trailblazer" },
  { level: 15, xp: 25000, title: "Thought Leader" },
  { level: 20, xp: 50000, title: "Master Scholar" },
  { level: 25, xp: 100000, title: "Master" },
  { level: 35, xp: 250000, title: "Grand Scholar" },
  { level: 50, xp: 500000, title: "Grand Master" },
];

export interface LevelInfo {
  level: number;
  currentXp: number;
  nextLevelXp: number;
  progress: number;
  title: string;
}

export function getLevelInfo(xp: number): LevelInfo {
  let level = 1;
  let title = LEVEL_THRESHOLDS[0].title;

  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i].xp) {
      level = LEVEL_THRESHOLDS[i].level;
      title = LEVEL_THRESHOLDS[i].title;
      break;
    }
  }

  const currentThreshold = LEVEL_THRESHOLDS.findLast((t) => t.xp <= xp) ?? LEVEL_THRESHOLDS[0];
  const nextThreshold = LEVEL_THRESHOLDS.find((t) => t.xp > xp);

  if (!nextThreshold) {
    return { level, currentXp: xp, nextLevelXp: xp, progress: 1, title };
  }

  const progress = (xp - currentThreshold.xp) / (nextThreshold.xp - currentThreshold.xp);

  return {
    level,
    currentXp: xp - currentThreshold.xp,
    nextLevelXp: nextThreshold.xp - currentThreshold.xp,
    progress: Math.min(progress, 1),
    title,
  };
}

export function getLevel(xp: number): number {
  return getLevelInfo(xp).level;
}

export function getLevelProgress(xp: number): number {
  return getLevelInfo(xp).progress;
}


