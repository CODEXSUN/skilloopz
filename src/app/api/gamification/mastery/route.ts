import { NextResponse } from "next/server";

import { getUserId } from "@/lib/auth";
import { getUserMasteryOverview, getWeakAreas, getStrongAreas, getSkillTrend } from "@/lib/gamification/mastery-service";
import { seedDefaultSkills } from "@/lib/gamification/skill-seeder";

export async function GET(request: Request) {
  const userId = await getUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  if (action === "seed") {
    const result = await seedDefaultSkills();
    return NextResponse.json(result);
  }

  const overview = await getUserMasteryOverview(userId);
  const weakAreas = await getWeakAreas(userId);
  const strongAreas = await getStrongAreas(userId);

  return NextResponse.json({
    overview: {
      totalSkills: overview.totalSkills,
      masteredCount: overview.masteredCount,
      avgScore: Math.round(overview.avgScore * 100),
      masteryPercentage: Math.round(overview.masteryPercentage),
      byCategory: Object.entries(overview.byCategory).map(([category, data]) => ({
        category,
        avgScore: Math.round(data.avgScore * 100),
        skillCount: data.skills.length,
        skills: data.skills.map((s) => ({
          id: s.skillId,
          name: s.skill.name,
          icon: s.skill.icon,
          color: s.skill.color,
          score: Math.round(s.score * 100),
          attempts: s.attempts,
          streak: s.streak,
          difficulty: s.difficulty,
        })),
      })),
    },
    weakAreas: weakAreas.map((w) => ({
      id: w.skillId,
      name: w.skill.name,
      icon: w.skill.icon,
      color: w.skill.color,
      score: Math.round(w.score * 100),
      attempts: w.attempts,
    })),
    strongAreas: strongAreas.map((s) => ({
      id: s.skillId,
      name: s.skill.name,
      icon: s.skill.icon,
      color: s.skill.color,
      score: Math.round(s.score * 100),
      streak: s.streak,
    })),
  });
}

export async function GET_TREND(
  _request: Request,
  { params }: { params: Promise<{ skillId: string }> },
) {
  const userId = await getUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { skillId } = await params;
  const trend = await getSkillTrend(userId, skillId);

  if (!trend) {
    return NextResponse.json({ error: "No data" }, { status: 404 });
  }

  return NextResponse.json(trend);
}
