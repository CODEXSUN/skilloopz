import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { OverviewStats } from "@/components/teacher/dashboard/overview-stats";
import { QuickActions } from "@/components/teacher/dashboard/quick-actions";
import { AtRiskStudentsContent } from "@/components/teacher/at-risk-students";
import { TeacherMasteryOverview } from "@/components/teacher/class-mastery-overview";

export default async function TeacherDashboardPage() {
  const authUser = await getUser();
  const userId = authUser?.id;
  const name = authUser?.email ? authUser.email.split("@")[0] : "there";

  let stats = { totalCourses: 0, totalStudents: 0, totalEnrollments: 0, averageProgress: 0 };

  try {
    const [totalCourses, enrollments, _progressData] = await Promise.all([
      prisma.course.count({ where: { teacherId: userId ?? "", deletedAt: null } }),
      prisma.enrollment.findMany({
        where: { course: { teacherId: userId ?? "", deletedAt: null } },
        select: { id: true, userId: true, progress: true },
      }),
      prisma.lessonProgress.findMany({
        where: { lesson: { module: { course: { teacherId: userId ?? "", deletedAt: null } } } },
        select: { score: true },
      }),
    ]);

    const totalEnrollments = enrollments.length;
    const totalStudents = new Set(enrollments.map((e) => e.userId)).size;
    const avgProgress = enrollments.length > 0
      ? enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length
      : 0;

    stats = { totalCourses, totalStudents, totalEnrollments, averageProgress: avgProgress };
  } catch {
    // Stats not available
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Welcome back, {name}!</h1>
        <p className="mt-1 text-muted-foreground">Here&apos;s an overview of your teaching.</p>
      </div>

      <OverviewStats stats={stats} />
      <QuickActions />

      <div>
        <h2 className="mb-3 text-lg font-semibold">At-Risk Students</h2>
        <AtRiskStudentsContent />
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Class Mastery Overview</h2>
        <TeacherMasteryOverview />
      </div>
    </div>
  );
}
