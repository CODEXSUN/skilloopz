import { type LevelInfo } from "./xp-calculator";

const LEVEL_TITLES: { minLevel: number; title: string }[] = [
  { minLevel: 1, title: "Beginner" },
  { minLevel: 2, title: "Curious Mind" },
  { minLevel: 3, title: "Eager Learner" },
  { minLevel: 4, title: "Knowledge Seeker" },
  { minLevel: 5, title: "Rising Scholar" },
  { minLevel: 7, title: "Dedicated Student" },
  { minLevel: 9, title: "Keen Explorer" },
  { minLevel: 11, title: "Bright Thinker" },
  { minLevel: 13, title: "Sharp Analyst" },
  { minLevel: 16, title: "Trailblazer" },
  { minLevel: 20, title: "Thought Leader" },
  { minLevel: 25, title: "Master Scholar" },
  { minLevel: 30, title: "Master" },
  { minLevel: 40, title: "Grand Scholar" },
  { minLevel: 50, title: "Grand Master" },
];

export function getLevelTitle(level: number): string {
  let title = LEVEL_TITLES[0].title;
  for (const t of LEVEL_TITLES) {
    if (level >= t.minLevel) title = t.title;
  }
  return title;
}

export type { LevelInfo };
