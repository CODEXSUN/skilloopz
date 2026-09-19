export interface DifficultySession {
  lessonId: string;
  correctAnswers: number;
  totalAnswers: number;
  timePerBlock: number[];
  difficultyRatings: ("too_easy" | "just_right" | "too_hard")[];
  startedAt: number;
  lastActivityAt: number;
}

const sessions = new Map<string, DifficultySession>();

export function startSession(lessonId: string): DifficultySession {
  const session: DifficultySession = {
    lessonId,
    correctAnswers: 0,
    totalAnswers: 0,
    timePerBlock: [],
    difficultyRatings: [],
    startedAt: Date.now(),
    lastActivityAt: Date.now(),
  };
  sessions.set(lessonId, session);
  return session;
}

export function getSession(lessonId: string): DifficultySession | undefined {
  return sessions.get(lessonId);
}

export function recordAnswer(lessonId: string, correct: boolean): void {
  const session = sessions.get(lessonId);
  if (!session) return;
  session.totalAnswers++;
  if (correct) session.correctAnswers++;
  session.lastActivityAt = Date.now();
}

export function recordTime(lessonId: string, seconds: number): void {
  const session = sessions.get(lessonId);
  if (!session) return;
  session.timePerBlock.push(seconds);
  session.lastActivityAt = Date.now();
}

export function recordDifficultyRating(
  lessonId: string,
  rating: "too_easy" | "just_right" | "too_hard",
): void {
  const session = sessions.get(lessonId);
  if (!session) return;
  session.difficultyRatings.push(rating);
  session.lastActivityAt = Date.now();
}

export function endSession(lessonId: string): DifficultySession | undefined {
  const session = sessions.get(lessonId);
  sessions.delete(lessonId);
  return session;
}

export function getSessionAccuracy(lessonId: string): number {
  const session = sessions.get(lessonId);
  if (!session || session.totalAnswers === 0) return 0;
  return session.correctAnswers / session.totalAnswers;
}

export function getSessionPerformanceTrend(lessonId: string): "improving" | "declining" | "stable" {
  const session = sessions.get(lessonId);
  if (!session || session.difficultyRatings.length < 3) return "stable";

  const recent = session.difficultyRatings.slice(-3);
  const tooHardCount = recent.filter((r) => r === "too_hard").length;
  const tooEasyCount = recent.filter((r) => r === "too_easy").length;

  if (tooHardCount >= 2) return "declining";
  if (tooEasyCount >= 2) return "improving";
  return "stable";
}

export function cleanupStaleSessions(maxAgeMs = 3600000): void {
  const now = Date.now();
  for (const [id, session] of sessions) {
    if (now - session.lastActivityAt > maxAgeMs) {
      sessions.delete(id);
    }
  }
}
