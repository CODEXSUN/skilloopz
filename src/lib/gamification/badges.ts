export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  xpReward: number;
  criteria: string;
}

export const BADGES: BadgeDefinition[] = [
  { id: "first_login", name: "Newcomer", description: "Log in for the first time", icon: "🌟", category: "progress", rarity: "common", xpReward: 10, criteria: '{"type":"first_login"}' },
  { id: "profile_complete", name: "All Set", description: "Complete your profile", icon: "✅", category: "progress", rarity: "common", xpReward: 25, criteria: '{"type":"profile_complete"}' },
  { id: "first_enrollment", name: "Enrolled", description: "Enroll in your first course", icon: "📚", category: "progress", rarity: "common", xpReward: 20, criteria: '{"type":"first_enrollment"}' },
  { id: "three_courses", name: "Course Explorer", description: "Enroll in 3 courses", icon: "🗺️", category: "progress", rarity: "uncommon", xpReward: 50, criteria: '{"type":"enrollments","value":3}' },
  { id: "first_bookmark", name: "Collector", description: "Bookmark your first lesson", icon: "🔖", category: "progress", rarity: "common", xpReward: 10, criteria: '{"type":"first_bookmark"}' },
  { id: "ten_bookmarks", name: "Hoarder", description: "Bookmark 10 lessons", icon: "📑", category: "progress", rarity: "uncommon", xpReward: 30, criteria: '{"type":"bookmarks","value":10}' },
  { id: "first_note", name: "Note Taker", description: "Write your first lesson note", icon: "📝", category: "progress", rarity: "common", xpReward: 10, criteria: '{"type":"first_note"}' },
  { id: "five_notes", name: "Scholar", description: "Write 5 lesson notes", icon: "📓", category: "progress", rarity: "uncommon", xpReward: 25, criteria: '{"type":"notes","value":5}' },
  { id: "quiz_master", name: "Quiz Master", description: "Pass 5 quizzes with 100%", icon: "🏆", category: "quiz", rarity: "rare", xpReward: 100, criteria: '{"type":"perfect_quizzes","value":5}' },
  { id: "speed_learner", name: "Speed Learner", description: "Complete 3 lessons in one day", icon: "⚡", category: "streak", rarity: "uncommon", xpReward: 50, criteria: '{"type":"lessons_per_day","value":3}' },
  { id: "week_warrior_badge", name: "Week Warrior", description: "Maintain a 7-day streak", icon: "🔥", category: "streak", rarity: "rare", xpReward: 75, criteria: '{"type":"streak","value":7}' },
  { id: "monthly_master_badge", name: "Monthly Master", description: "Maintain a 30-day streak", icon: "💎", category: "streak", rarity: "epic", xpReward: 200, criteria: '{"type":"streak","value":30}' },
  { id: "first_certificate", name: "Graduate", description: "Earn your first certificate", icon: "🎓", category: "mastery", rarity: "rare", xpReward: 100, criteria: '{"type":"certificates","value":1}' },
  { id: "five_certificates", name: "Scholar Elite", description: "Earn 5 certificates", icon: "🎖️", category: "mastery", rarity: "epic", xpReward: 250, criteria: '{"type":"certificates","value":5}' },
  { id: "xp_1000", name: "XP Hunter", description: "Accumulate 1,000 XP", icon: "💰", category: "mastery", rarity: "uncommon", xpReward: 50, criteria: '{"type":"total_xp","value":1000}' },
  { id: "xp_5000", name: "XP Mogul", description: "Accumulate 5,000 XP", icon: "💎", category: "mastery", rarity: "rare", xpReward: 150, criteria: '{"type":"total_xp","value":5000}' },
  { id: "level_10", name: "Rising Star", description: "Reach level 10", icon: "⭐", category: "mastery", rarity: "uncommon", xpReward: 100, criteria: '{"type":"level","value":10}' },
  { id: "level_25", name: "Veteran", description: "Reach level 25", icon: "🌟", category: "mastery", rarity: "rare", xpReward: 200, criteria: '{"type":"level","value":25}' },
  { id: "level_50", name: "Legend", description: "Reach level 50", icon: "👑", category: "mastery", rarity: "legendary", xpReward: 500, criteria: '{"type":"level","value":50}' },
  { id: "helper", name: "Helper", description: "Complete a course with a friend enrolled", icon: "🤝", category: "social", rarity: "rare", xpReward: 50, criteria: '{"type":"social_course","value":1}' },
];

export const BADGE_CATEGORIES = [
  { id: "progress", label: "Progress", color: "text-blue-400" },
  { id: "quiz", label: "Quiz", color: "text-purple-400" },
  { id: "streak", label: "Streak", color: "text-orange-400" },
  { id: "mastery", label: "Mastery", color: "text-yellow-400" },
  { id: "social", label: "Social", color: "text-green-400" },
];
