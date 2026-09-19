export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  icon?: string;
  xpReward: number;
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
  { id: "first_lesson", name: "First Steps", description: "Complete your first lesson", xpReward: 50 },
  { id: "ten_lessons", name: "Dedicated Learner", description: "Complete 10 lessons", xpReward: 200 },
  { id: "fifty_lessons", name: "Knowledge Seeker", description: "Complete 50 lessons", xpReward: 500 },
  { id: "hundred_lessons", name: "Century Scholar", description: "Complete 100 lessons", xpReward: 1000 },
  { id: "seven_day_streak", name: "Week Warrior", description: "Maintain a 7-day streak", xpReward: 150 },
  { id: "thirty_day_streak", name: "Monthly Master", description: "Maintain a 30-day streak", xpReward: 500 },
  { id: "perfect_quiz", name: "Perfect Score", description: "Get 100% on a quiz", xpReward: 100 },
  { id: "first_course", name: "Course Complete", description: "Complete your first course", xpReward: 300 },
  { id: "five_courses", name: "Course Collector", description: "Complete 5 courses", xpReward: 1000 },
];

export function checkAchievements(completedLessons: number, longestStreak: number): AchievementDefinition[] {
  const unlocked: AchievementDefinition[] = [];

  if (completedLessons >= 1) unlocked.push(ACHIEVEMENTS[0]);
  if (completedLessons >= 10) unlocked.push(ACHIEVEMENTS[1]);
  if (completedLessons >= 50) unlocked.push(ACHIEVEMENTS[2]);
  if (completedLessons >= 100) unlocked.push(ACHIEVEMENTS[3]);
  if (longestStreak >= 7) unlocked.push(ACHIEVEMENTS[4]);
  if (longestStreak >= 30) unlocked.push(ACHIEVEMENTS[5]);

  return unlocked;
}
