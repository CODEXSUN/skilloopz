import { getSessionAccuracy, getSessionPerformanceTrend } from "./difficulty-tracker";

export interface ScalerInput {
  lessonId: string;
  currentDifficulty: number;
  masteryScore: number;
  preferredDifficulty: number;
  correctAnswers: number;
  totalAnswers: number;
}

export interface ScalerResult {
  recommendedDifficulty: number;
  adjustment: number;
  reason: string;
}

const MIN_DIFFICULTY = 1;
const MAX_DIFFICULTY = 5;

const DIFFICULTY_LABELS: Record<number, string> = {
  1: "Beginner",
  2: "Easy",
  3: "Intermediate",
  4: "Hard",
  5: "Expert",
};

export function getDifficultyLabel(level: number): string {
  return DIFFICULTY_LABELS[level] ?? `Level ${level}`;
}

export function calculateDifficulty(input: ScalerInput): ScalerResult {
  const accuracy = input.totalAnswers > 0
    ? input.correctAnswers / input.totalAnswers
    : getSessionAccuracy(input.lessonId);

  const trend = getSessionPerformanceTrend(input.lessonId);
  const current = input.currentDifficulty;
  let adjustment = 0;
  let reason = "";

  if (input.totalAnswers >= 3) {
    if (accuracy >= 0.8 && trend === "improving") {
      adjustment = 1;
      reason = "High accuracy with improving trend — increasing difficulty";
    } else if (accuracy >= 0.8) {
      adjustment = 1;
      reason = "High accuracy — increasing difficulty";
    } else if (accuracy <= 0.4 && trend === "declining") {
      adjustment = -1;
      reason = "Low accuracy with declining trend — reducing difficulty";
    } else if (accuracy <= 0.4) {
      adjustment = -1;
      reason = "Low accuracy — reducing difficulty";
    }
  }

  if (adjustment === 0 && input.preferredDifficulty !== current) {
    const diff = input.preferredDifficulty - current;
    if (Math.abs(diff) >= 2) {
      adjustment = diff > 0 ? 1 : -1;
      reason = `Aligning with your preferred difficulty (${getDifficultyLabel(input.preferredDifficulty)})`;
    }
  }

  if (adjustment === 0 && input.masteryScore > 0) {
    const targetDifficulty = Math.max(1, Math.min(5, Math.round(input.masteryScore * 5)));
    if (targetDifficulty !== current) {
      adjustment = targetDifficulty > current ? 1 : -1;
      reason = `Adjusting based on your mastery score (${Math.round(input.masteryScore * 100)}%)`;
    }
  }

  const recommended = Math.max(MIN_DIFFICULTY, Math.min(MAX_DIFFICULTY, current + adjustment));
  if (recommended === current) {
    reason = "Current difficulty is appropriate";
  }

  return {
    recommendedDifficulty: recommended,
    adjustment,
    reason,
  };
}

export function getDifficultyColor(level: number): string {
  if (level <= 2) return "text-green-400";
  if (level <= 3) return "text-yellow-400";
  return "text-red-400";
}
