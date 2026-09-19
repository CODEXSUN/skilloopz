import { useEffect, useState } from "react";
import { Navigate, useParams, useSearchParams } from "react-router-dom";
import { PublicLayout } from "@/components/layout/public-layout";
import { AppLayout } from "@/components/layout/app-layout";
import { CoursesContent } from "@/components/courses/courses-content";
import { CourseDetailContent } from "@/app/courses/[courseId]/page";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { DashboardCoursesContent } from "@/components/dashboard/courses-content";

interface User {
  email: string;
  role: string;
  onboardingCompleted: boolean;
}

interface Enrollment {
  id: string;
  progress: number;
  course: {
    id: string;
    title: string;
    description: string | null;
    thumbnailUrl: string | null;
    difficulty: string;
    estimatedMinutes: number | null;
    category: { name: string } | null;
  } | null;
}

function useCurrentUser() {
  const [user, setUser] = useState<User | null>();
  useEffect(() => {
    fetch("/api/auth/me")
      .then((response) => response.ok ? response.json() : null)
      .then((data) => setUser(data?.user ?? null))
      .catch(() => setUser(null));
  }, []);
  return user;
}

export function CatalogPage() {
  const [search] = useSearchParams();
  return <PublicLayout><CoursesContent initialTag={search.get("tag") ?? undefined} /></PublicLayout>;
}

export function CoursePage() {
  const { courseId } = useParams();
  return <PublicLayout><main className="min-h-screen px-6 pb-24 pt-32"><CourseDetailContent courseId={courseId ?? ""} /></main></PublicLayout>;
}

export function OnboardingPage() {
  const user = useCurrentUser();
  if (user === undefined) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.onboardingCompleted) return <Navigate to="/dashboard" replace />;
  return <OnboardingWizard role={user.role} email={user.email} />;
}

export function LearnerPage() {
  const user = useCurrentUser();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  useEffect(() => {
    if (!user) return;
    fetch("/api/enrollments")
      .then((response) => response.ok ? response.json() : [])
      .then(setEnrollments)
      .catch(() => setEnrollments([]));
  }, [user]);

  if (user === undefined) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.onboardingCompleted) return <Navigate to="/onboarding" replace />;
  return <AppLayout role="student"><DashboardCoursesContent enrollments={enrollments.filter((item) => item.course !== null) as Parameters<typeof DashboardCoursesContent>[0]["enrollments"]} /></AppLayout>;
}
