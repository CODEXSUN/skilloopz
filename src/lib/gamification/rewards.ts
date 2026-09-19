export interface RewardDefinition {
  id: string;
  name: string;
  description: string;
  requiredLevel: number;
  icon: string;
}

export const REWARDS: RewardDefinition[] = [
  { id: "custom_avatar", name: "Custom Avatar", description: "Unlock custom avatar options", requiredLevel: 5, icon: "user" },
  { id: "profile_badge", name: "Profile Badge", description: "Display your level badge on profile", requiredLevel: 10, icon: "badge" },
  { id: "theme_picker", name: "Theme Picker", description: "Choose from premium color themes", requiredLevel: 15, icon: "palette" },
  { id: "download_certificate", name: "Certificate Download", description: "Download course completion certificates", requiredLevel: 20, icon: "award" },
  { id: "mentor_access", name: "Mentor Access", description: "Become a mentor for new students", requiredLevel: 30, icon: "graduation-cap" },
];

export function getUnlockedRewards(level: number): RewardDefinition[] {
  return REWARDS.filter((r) => level >= r.requiredLevel);
}

export function getLockedRewards(level: number): RewardDefinition[] {
  return REWARDS.filter((r) => level < r.requiredLevel);
}
