import { prisma } from "@/lib/db";
import { SEASONAL_EVENTS, getActiveEvents } from "./seasonal-events";

export interface ActiveEvent {
  id: string;
  name: string;
  description: string;
  icon: string;
  multiplier: number;
  xpBonus: number;
  challenge: { type: string; target: number; label: string };
  endsAt: string;
  progress: number;
}

export async function ensureSeasonalEventsSeeded(): Promise<void> {
  await prisma.$transaction(async (tx) => {
    for (const event of SEASONAL_EVENTS) {
      await tx.seasonalEvent.upsert({
        where: { id: event.id },
        update: {
          name: event.name,
          description: event.description,
          icon: event.icon,
          multiplier: event.multiplier,
          startsAt: new Date(event.startsAt),
          endsAt: new Date(event.endsAt),
          xpBonus: event.xpBonus,
        },
        create: {
          id: event.id,
          name: event.name,
          description: event.description,
          icon: event.icon,
          multiplier: event.multiplier,
          startsAt: new Date(event.startsAt),
          endsAt: new Date(event.endsAt),
          xpBonus: event.xpBonus,
        },
      });
    }
  });
}

export async function getActiveEventsForUser(userId: string): Promise<ActiveEvent[]> {
  const activeEvents = getActiveEvents();
  const progress = await prisma.userSeasonalProgress.findMany({
    where: { userId },
  });
  const progressMap = new Map(progress.map((p) => [p.eventId, p]));

  return activeEvents.map((event) => ({
    id: event.id,
    name: event.name,
    description: event.description,
    icon: event.icon,
    multiplier: event.multiplier,
    xpBonus: event.xpBonus,
    challenge: event.challenge,
    endsAt: event.endsAt,
    progress: progressMap.get(event.id)?.lessonsDone ?? 0,
  }));
}

export async function trackSeasonalProgress(
  userId: string,
  tx: any,
): Promise<{ event: string; xpBonus: number }[]> {
  const activeEvents = getActiveEvents();
  if (activeEvents.length === 0) return [];

  const bonuses: { event: string; xpBonus: number }[] = [];

  for (const event of activeEvents) {
    const progress = await tx.userSeasonalProgress.upsert({
      where: { userId_eventId: { userId, eventId: event.id } },
      update: { lessonsDone: { increment: 1 }, updatedAt: new Date() },
      create: { userId, eventId: event.id, lessonsDone: 1 },
    });

    if (event.xpBonus > 0) {
      await tx.xPTransaction.create({
        data: {
          userId,
          amount: event.xpBonus,
          reason: "seasonal_event",
          referenceId: event.id,
        },
      });
      await tx.profile.update({
        where: { id: userId },
        data: { xp: { increment: event.xpBonus } },
      });
      bonuses.push({ event: event.name, xpBonus: event.xpBonus });
    }
  }

  return bonuses;
}

export function getActiveMultiplier(): number {
  const events = getActiveEvents();
  if (events.length === 0) return 1.0;
  return Math.max(...events.map((e) => e.multiplier));
}
