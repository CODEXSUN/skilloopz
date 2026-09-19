import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DashboardCoursesContent } from "@/components/dashboard/courses-content";

export default async function DashboardCoursesPage() {
  const user = await getUser();
  if (!user) return null;

  let enrollments: {
    id: string;
    progress: number;
    archived: boolean;
    course: { id: string; title: string; description: string | null; thumbnailUrl: string | null; difficulty: string; estimatedMinutes: number | null; category: { name: string } | null };
  }[] = [];

  try {
    enrollments = await prisma.enrollment.findMany({
      where: { userId: user.id, course: { deletedAt: null } },
      include: {
        course: {
          include: { category: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });
  } catch {
    // Not available
  }

  return <DashboardCoursesContent enrollments={enrollments} />;
}
