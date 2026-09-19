"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface CourseListItem {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  subject: string | null;
  gradeLevel: string | null;
  difficulty: string;
  status: string;
  estimatedMinutes: number | null;
  createdAt: string;
  category: { id: string; name: string; slug: string } | null;
  teacher: { id: string; fullName: string | null; avatarUrl: string | null };
  tags: { tag: { id: string; name: string; slug: string } }[];
  _count: { modules: number; enrollments: number };
}

async function fetchCourses(params?: {
  categoryId?: string;
  teacherId?: string;
  status?: string;
  tag?: string;
  search?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params?.categoryId) searchParams.set("categoryId", params.categoryId);
  if (params?.teacherId) searchParams.set("teacherId", params.teacherId);
  if (params?.status) searchParams.set("status", params.status);
  if (params?.tag) searchParams.set("tag", params.tag);
  if (params?.search) searchParams.set("search", params.search);

  const qs = searchParams.toString();
  const res = await fetch(`/api/courses${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error("Failed to fetch courses");
  return res.json() as Promise<CourseListItem[]>;
}

export function useCourses(params?: {
  categoryId?: string;
  teacherId?: string;
  status?: string;
  tag?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ["courses", params],
    queryFn: () => fetchCourses(params),
  });
}

export function useCourse(courseId: string) {
  return useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const res = await fetch(`/api/courses/${courseId}`);
      if (!res.ok) throw new Error("Failed to fetch course");
      return res.json();
    },
    enabled: !!courseId,
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      description?: string;
      categoryId?: string;
      subject?: string;
      difficulty?: string;
      estimatedMinutes?: number;
    }) => {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create course");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}

export function useUpdateCourse(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update course");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}
