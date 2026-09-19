"use client";

import { motion } from "framer-motion";
import { Calendar, Clock, Zap } from "lucide-react";

const easing = [0.16, 1, 0.3, 1] as const;

interface ActiveEvent {
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

interface Props {
  events: ActiveEvent[];
}

export function SeasonalEventsContent({ events }: Props) {
  if (events.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="font-heading text-lg font-bold tracking-tight text-foreground">
        Active Events
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {events.map((event, i) => {
          const progressPercent = Math.min(100, (event.progress / event.challenge.target) * 100);
          const endsAt = new Date(event.endsAt);
          const daysLeft = Math.ceil((endsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: easing }}
              className="relative overflow-hidden rounded-2xl border border-purple-500/20 bg-purple-500/5 p-5 shadow-xl"
            >
              <div className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-purple-500/10 blur-[50px]" />
              <div className="relative z-10">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{event.icon}</span>
                    <div>
                      <p className="font-semibold text-foreground">{event.name}</p>
                      <p className="text-xs text-muted-foreground">{event.description}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-xs font-medium text-purple-400">
                    {event.multiplier}x XP
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{event.challenge.label}</span>
                    <span className="text-foreground">{event.progress}/{event.challenge.target}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[rgba(255,255,255,0.05)]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Zap className="h-3 w-3 text-yellow-400" />
                    +{event.xpBonus} XP bonus per lesson
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {daysLeft} days left
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
