"use client";

import { useEffect, useState, useRef } from "react";
import { Clock } from "lucide-react";

import { cn } from "@/lib/utils";

interface QuizTimerProps {
  timeLimit: number;
  onTimeUp: () => void;
  onTick: (seconds: number) => void;
}

export function QuizTimer({ timeLimit, onTimeUp, onTick }: QuizTimerProps) {
  const [remaining, setRemaining] = useState(timeLimit * 60);
  const calledRef = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining((prev) => {
        const next = prev - 1;
        onTick(timeLimit * 60 - next);

        if (next <= 0 && !calledRef.current) {
          calledRef.current = true;
          clearInterval(interval);
          onTimeUp();
        }

        return Math.max(next, 0);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLimit, onTimeUp, onTick]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const isLow = remaining < 60;

  return (
    <div
      className={cn(
        "flex items-center gap-1 text-sm font-medium",
        isLow ? "text-red-600" : "text-muted-foreground",
      )}
    >
      <Clock className="h-4 w-4" />
      <span>
        {minutes}:{seconds.toString().padStart(2, "0")}
      </span>
    </div>
  );
}
