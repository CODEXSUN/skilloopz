export type FeatureFlag = {
  key: string;
  label: string;
  description: string;
  defaultValue: boolean;
  group: string;
};

export const FEATURE_FLAGS: FeatureFlag[] = [
  { key: "gamification_enabled", label: "Gamification", description: "XP, levels, streaks, leaderboard", defaultValue: true, group: "features" },
  { key: "achievements_enabled", label: "Achievements", description: "Achievement badges and rewards", defaultValue: true, group: "features" },
  { key: "recommendations_enabled", label: "Recommendations", description: "Personalized course recommendations", defaultValue: true, group: "features" },
  { key: "certificates_enabled", label: "Certificates", description: "Course completion certificates", defaultValue: true, group: "features" },
  { key: "parent_dashboard_enabled", label: "Parent Dashboard", description: "Parent monitoring features", defaultValue: true, group: "features" },
  { key: "notifications_enabled", label: "Notifications", description: "In-app notification system", defaultValue: true, group: "features" },
  { key: "search_enabled", label: "Search", description: "Global search functionality", defaultValue: true, group: "features" },
  { key: "public_signup_enabled", label: "Public Signup", description: "Allow new user registration", defaultValue: true, group: "auth" },
  { key: "teacher_signup_enabled", label: "Teacher Signup", description: "Allow teacher account registration", defaultValue: true, group: "auth" },
  { key: "maintenance_mode", label: "Maintenance Mode", description: "Block all non-admin access", defaultValue: false, group: "system" },
];
