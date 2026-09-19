"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useLessonProgress(lessonId: string) {
  return useQuery({
    queryKey: ["lessonProgress", lessonId],
    queryFn: async () => {
      const res = await fetch(`/api/lessons/${lessonId}/progress`);
      if (!res.ok) throw new Error("Failed to fetch progress");
      return res.json() as Promise<{
        status: string;
        timeSpent: number;
        score: number | null;
        metadata?: string;
      }>;
    },
    enabled: !!lessonId,
    refetchInterval: 30000,
  });
}

export function useUpdateProgress(lessonId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      status?: string;
      timeSpent?: number;
      score?: number;
      metadata?: Record<string, unknown>;
    }) => {
      const res = await fetch(`/api/lessons/${lessonId}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update progress");
      return res.json() as Promise<{
        progress: { status: string; timeSpent: number };
        xpAwarded: number;
        streak: number;
        longestStreak: number;
        level: number;
        courseCompleted: boolean;
        newAchievements?: { id: string; name: string; description: string; xpReward: number }[];
        newBadges?: { id: string; name: string; description: string; icon: string; xpReward: number }[];
      }>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessonProgress", lessonId] });
    },
  });
}
