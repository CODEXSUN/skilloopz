export function calculateEnrollmentProgress(completedLessons: number, totalLessons: number): number {
  if (totalLessons === 0) return 0;
  return Math.round((completedLessons / totalLessons) * 100);
}

export function isCourseComplete(completedLessons: number, totalLessons: number): boolean {
  return totalLessons > 0 && completedLessons >= totalLessons;
}
