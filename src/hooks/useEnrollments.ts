"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useEnrollments() {
  return useQuery({
    queryKey: ["enrollments"],
    queryFn: async () => {
      const res = await fetch("/api/enrollments/mine");
      if (!res.ok) throw new Error("Failed to fetch enrollments");
      return res.json();
    },
  });
}

export function useEnroll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: string) => {
      const res = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to enroll");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
    },
  });
}
