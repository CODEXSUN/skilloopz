export interface StreakResult {
  streak: number;
  longestStreak: number;
  lastActivityDate: Date | null;
  incremented: boolean;
  reset: boolean;
}

export function calculateStreak(
  lastActivityDate: Date | null,
  currentStreak: number,
  longestStreak: number,
): StreakResult {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const last = lastActivityDate
    ? new Date(lastActivityDate.getFullYear(), lastActivityDate.getMonth(), lastActivityDate.getDate())
    : null;

  if (!last) {
    return {
      streak: 1,
      longestStreak: Math.max(longestStreak, 1),
      lastActivityDate: now,
      incremented: true,
      reset: false,
    };
  }

  const diffDays = Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return {
      streak: currentStreak,
      longestStreak,
      lastActivityDate: last,
      incremented: false,
      reset: false,
    };
  }

  if (diffDays === 1) {
    const newStreak = currentStreak + 1;
    return {
      streak: newStreak,
      longestStreak: Math.max(longestStreak, newStreak),
      lastActivityDate: now,
      incremented: true,
      reset: false,
    };
  }

  return {
    streak: 1,
    longestStreak,
    lastActivityDate: now,
    incremented: true,
    reset: true,
  };
}
