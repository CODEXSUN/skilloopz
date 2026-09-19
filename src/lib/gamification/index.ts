export { calculateStreak } from "./streak-tracker";
export type { StreakResult } from "./streak-tracker";

export { XP_REWARDS, XP_MULTIPLIERS, getLevelInfo, getLevel, getLevelProgress, calculateXP } from "./xp-calculator";
export type { LevelInfo, XPCalculationOptions, XPCalculationResult } from "./xp-calculator";

export { getLevelTitle } from "./level-system";

export { ACHIEVEMENTS, checkAchievements } from "./achievements";
export type { AchievementDefinition } from "./achievements";
export { checkAndAwardAchievements, ensureAchievementsSeeded } from "./achievement-service";
export type { NewAchievement } from "./achievement-service";

export { REWARDS, getUnlockedRewards, getLockedRewards } from "./rewards";
export type { RewardDefinition } from "./rewards";

export { BADGES, BADGE_CATEGORIES } from "./badges";
export type { BadgeDefinition } from "./badges";
export { checkAndAwardBadges, ensureBadgesSeeded } from "./badge-service";
export type { NewBadge } from "./badge-service";

export { getActiveEvents, getUpcomingEvents, SEASONAL_EVENTS } from "./seasonal-events";
export type { SeasonalEventDefinition } from "./seasonal-events";
export { getActiveEventsForUser, trackSeasonalProgress, getActiveMultiplier, ensureSeasonalEventsSeeded } from "./seasonal-event-service";
export type { ActiveEvent } from "./seasonal-event-service";

export { calculateMasteryScore, adjustDifficulty, getMasteryLevel, getMasteryColor, getTrend, getNextRecommendation } from "./mastery-engine";
export type { MasteryResult, MasteryUpdate } from "./mastery-engine";
export { updateSkillMastery, updateLessonMastery, getUserMasteryOverview, getSkillTrend, getWeakAreas, getStrongAreas } from "./mastery-service";
export { seedDefaultSkills } from "./skill-seeder";

export { getRecommendations } from "./recommendation-engine";
export type { Recommendation } from "./recommendation-engine";

export { getStreakNotifications, getStreakHistory } from "./streak-notifications";
export type { StreakNotification } from "./streak-notifications";

export { getSpacedRepetitionReviews, getReviewSummary } from "./spaced-repetition";
export type { ReviewItem } from "./spaced-repetition";
