export interface UserXP {
  user_id: string;
  total_xp: number;
  level: number;
  xp_to_next_level: number;
  updated_at: string;
}

export interface Streak {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
  updated_at: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon_url: string | null;
  xp_reward: number;
  criteria: Record<string, unknown>;
  created_at: string;
}

export interface UserAchievement {
  user_id: string;
  achievement_id: string;
  earned_at: string;
}

export interface LeaderboardEntry {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  total_xp: number;
  level: number;
  rank: number;
}

export type XPReason =
  | "lesson_completed"
  | "quiz_passed"
  | "streak_bonus"
  | "achievement_earned"
  | "course_completed"
  | "daily_login";

export interface XPTransaction {
  id: string;
  user_id: string;
  amount: number;
  reason: XPReason;
  reference_id: string | null;
  created_at: string;
}
