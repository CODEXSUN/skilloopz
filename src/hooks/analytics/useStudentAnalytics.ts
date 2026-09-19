"use client";

import { useQuery } from "@tanstack/react-query";
import type { StudentAnalyticsData } from "@/app/api/analytics/student/route";

export function useStudentAnalytics() {
  return useQuery<StudentAnalyticsData>({
    queryKey: ["student-analytics"],
    queryFn: async () => {
      const res = await fetch("/api/analytics/student");
      if (!res.ok) throw new Error("Failed to load analytics");
      return res.json();
    },
    staleTime: 1000 * 60 * 2,
  });
}
