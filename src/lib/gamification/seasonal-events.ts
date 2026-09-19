export interface SeasonalEventDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  multiplier: number;
  xpBonus: number;
  startsAt: string;
  endsAt: string;
  challenge: { type: string; target: number; label: string };
}

function getDate(month: number, day: number, year = 2026): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T00:00:00.000Z`;
}

export const SEASONAL_EVENTS: SeasonalEventDefinition[] = [
  {
    id: "spring_learning_2026",
    name: "Spring Learning Sprint",
    description: "Double XP for all lessons completed during spring!",
    icon: "🌸",
    multiplier: 2.0,
    xpBonus: 25,
    startsAt: getDate(3, 20),
    endsAt: getDate(6, 20),
    challenge: { type: "lessons", target: 20, label: "Complete 20 lessons" },
  },
  {
    id: "summer_challenge_2026",
    name: "Summer Learning Challenge",
    description: "1.5x XP + bonus XP for daily streaks during summer.",
    icon: "☀️",
    multiplier: 1.5,
    xpBonus: 50,
    startsAt: getDate(6, 21),
    endsAt: getDate(9, 22),
    challenge: { type: "streak", target: 30, label: "Maintain a 30-day streak" },
  },
  {
    id: "fall_knowledge_2026",
    name: "Fall Knowledge Festival",
    description: "Earn bonus XP for completing courses during fall.",
    icon: "🍂",
    multiplier: 1.5,
    xpBonus: 75,
    startsAt: getDate(9, 23),
    endsAt: getDate(12, 20),
    challenge: { type: "courses", target: 3, label: "Complete 3 courses" },
  },
  {
    id: "winter_marathon_2026",
    name: "Winter Learning Marathon",
    description: "Triple XP on weekends during winter!",
    icon: "❄️",
    multiplier: 3.0,
    xpBonus: 100,
    startsAt: getDate(12, 21),
    endsAt: getDate(3, 19, 2027),
    challenge: { type: "lessons", target: 50, label: "Complete 50 lessons" },
  },
  {
    id: "new_year_goals_2026",
    name: "New Year Goals",
    description: "Start the year strong — bonus XP for first lessons of the year.",
    icon: "🎯",
    multiplier: 2.0,
    xpBonus: 50,
    startsAt: getDate(1, 1),
    endsAt: getDate(1, 31),
    challenge: { type: "lessons", target: 10, label: "Complete 10 lessons in January" },
  },
  {
    id: "halloween_spooky_2026",
    name: "Spooky Learning Week",
    description: "Earn bonus XP for learning during Halloween week!",
    icon: "🎃",
    multiplier: 2.0,
    xpBonus: 30,
    startsAt: getDate(10, 25),
    endsAt: getDate(11, 1),
    challenge: { type: "lessons", target: 7, label: "Complete 7 lessons in spooky week" },
  },
];

export function getActiveEvents(now = new Date()): SeasonalEventDefinition[] {
  return SEASONAL_EVENTS.filter((event) => {
    const start = new Date(event.startsAt);
    const end = new Date(event.endsAt);
    return now >= start && now <= end;
  });
}

export function getUpcomingEvents(now = new Date(), daysAhead = 7): SeasonalEventDefinition[] {
  const future = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
  return SEASONAL_EVENTS.filter((event) => {
    const start = new Date(event.startsAt);
    return start > now && start <= future;
  });
}
