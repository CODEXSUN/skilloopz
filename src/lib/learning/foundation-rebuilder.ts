import { prisma } from "@/lib/db";

export interface RebuildSuggestion {
  islandId: string;
  islandTitle: string;
  worldTitle: string | null;
  weakConcepts: {
    conceptId: string;
    conceptTitle: string;
    difficulty: number;
    masteryScore: number;
    missingPrerequisites: {
      conceptId: string;
      conceptTitle: string;
      difficulty: number;
      isMastered: boolean;
      score: number;
    }[];
  }[];
  priority: "critical" | "moderate" | "low";
  reason: string;
}

export async function getFoundationRebuildSuggestions(userId: string): Promise<{
  suggestions: RebuildSuggestion[];
  totalGaps: number;
  criticalCount: number;
}> {
  const progress = await prisma.worldProgress.findMany({
    where: { userId },
    include: {
      island: {
        include: {
          world: true,
          concepts: {
            include: {
              prerequisites: {
                include: {
                  prerequisite: true,
                },
              },
            },
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });

  const skillMastery = await prisma.skillMastery.findMany({
    where: { userId },
    include: { skill: true },
  });

  const masteryBySkillName = new Map<string, number>();
  for (const m of skillMastery) {
    masteryBySkillName.set(m.skill.name.toLowerCase(), m.score);
  }

  const suggestions: RebuildSuggestion[] = [];
  let totalGaps = 0;
  let criticalCount = 0;

  for (const p of progress) {
    const island = p.island;
    if (!island || p.status === "completed") continue;

    if (p.status === "locked") {
      const missing = island.concepts.flatMap((concept) => {
        return concept.prerequisites
          .filter((pre) => {
            const preName = pre.prerequisite.title.toLowerCase();
            const score = masteryBySkillName.get(preName) ?? 0;
            return score < 0.4;
          })
          .map((pre) => ({
            conceptId: pre.prerequisite.id,
            conceptTitle: pre.prerequisite.title,
            difficulty: pre.prerequisite.difficulty,
            isMastered: (masteryBySkillName.get(pre.prerequisite.title.toLowerCase()) ?? 0) >= 0.7,
            score: masteryBySkillName.get(pre.prerequisite.title.toLowerCase()) ?? 0,
          }));
      });

      if (missing.length > 0) {
        totalGaps += missing.length;
        criticalCount++;
        suggestions.push({
          islandId: island.id,
          islandTitle: island.title,
          worldTitle: island.world?.title ?? null,
          weakConcepts: island.concepts
            .filter((c) =>
              c.prerequisites.some((pre) => {
                const score = masteryBySkillName.get(pre.prerequisite.title.toLowerCase()) ?? 0;
                return score < 0.4;
              }),
            )
            .map((c) => ({
              conceptId: c.id,
              conceptTitle: c.title,
              difficulty: c.difficulty,
              masteryScore: masteryBySkillName.get(c.title.toLowerCase()) ?? 0,
              missingPrerequisites: c.prerequisites
                .filter((pre) => {
                  const score = masteryBySkillName.get(pre.prerequisite.title.toLowerCase()) ?? 0;
                  return score < 0.4;
                })
                .map((pre) => ({
                  conceptId: pre.prerequisite.id,
                  conceptTitle: pre.prerequisite.title,
                  difficulty: pre.prerequisite.difficulty,
                  isMastered: (masteryBySkillName.get(pre.prerequisite.title.toLowerCase()) ?? 0) >= 0.7,
                  score: masteryBySkillName.get(pre.prerequisite.title.toLowerCase()) ?? 0,
                })),
            })),
          priority: "critical",
          reason: `${island.title} is locked. Build foundation by mastering prerequisite concepts first.`,
        });
      }
      continue;
    }

    const weakConcepts = island.concepts
      .map((concept) => {
        const conceptMastery = masteryBySkillName.get(concept.title.toLowerCase()) ?? 0;
        const missingPre = concept.prerequisites
          .filter((pre) => {
            const score = masteryBySkillName.get(pre.prerequisite.title.toLowerCase()) ?? 0;
            return score < 0.5;
          })
          .map((pre) => ({
            conceptId: pre.prerequisite.id,
            conceptTitle: pre.prerequisite.title,
            difficulty: pre.prerequisite.difficulty,
            isMastered: (masteryBySkillName.get(pre.prerequisite.title.toLowerCase()) ?? 0) >= 0.7,
            score: masteryBySkillName.get(pre.prerequisite.title.toLowerCase()) ?? 0,
          }));
        return { concept, conceptMastery, missingPre };
      })
      .filter((c) => c.missingPre.length > 0);

    if (weakConcepts.length > 0) {
      totalGaps += weakConcepts.reduce((sum, c) => sum + c.missingPre.length, 0);
      const isCritical = weakConcepts.some((c) => c.conceptMastery < 0.3);
      if (isCritical) criticalCount++;

      const avgMastery =
        weakConcepts.reduce((sum, c) => sum + c.conceptMastery, 0) / weakConcepts.length;

      let priority: "critical" | "moderate" | "low";
      let reason: string;
      if (avgMastery < 0.3) {
        priority = "critical";
        reason = `Critical foundation gaps detected in ${island.title}. Your understanding of core concepts needs reinforcement before progressing.`;
      } else if (avgMastery < 0.6) {
        priority = "moderate";
        reason = `Moderate gaps found in prerequisite concepts for ${island.title}. Reviewing these will strengthen your understanding.`;
      } else {
        priority = "low";
        reason = `Minor gaps detected in ${island.title}. A quick review of prerequisite concepts is recommended.`;
      }

      suggestions.push({
        islandId: island.id,
        islandTitle: island.title,
        worldTitle: island.world?.title ?? null,
        weakConcepts: weakConcepts.map((c) => ({
          conceptId: c.concept.id,
          conceptTitle: c.concept.title,
          difficulty: c.concept.difficulty,
          masteryScore: c.conceptMastery,
          missingPrerequisites: c.missingPre,
        })),
        priority,
        reason,
      });
    }
  }

  suggestions.sort((a, b) => {
    const order = { critical: 0, moderate: 1, low: 2 };
    return order[a.priority] - order[b.priority];
  });

  return {
    suggestions,
    totalGaps,
    criticalCount,
  };
}
