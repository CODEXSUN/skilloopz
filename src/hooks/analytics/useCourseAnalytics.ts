"use client";

import { useQuery } from "@tanstack/react-query";
import type { AnalyticsData } from "@/app/api/analytics/route";

export function useCourseAnalytics() {
  return useQuery<AnalyticsData>({
    queryKey: ["analytics"],
    queryFn: async () => {
      const res = await fetch("/api/analytics");
      if (!res.ok) throw new Error("Failed to load analytics");
      return res.json();
    },
    staleTime: 1000 * 60 * 2,
  });
}
