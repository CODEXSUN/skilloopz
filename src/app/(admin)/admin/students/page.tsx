import { prisma } from "@/lib/db";
import { AdminStudentsClient } from "@/components/admin/students/students-client";

interface StudentRecord {
  id: string;
  email: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  xp: number;
  level: number;
  currentStreak: number;
  createdAt: string;
  enrolledCourses: number;
  parentName: string | null;
}

export default async function AdminStudentsPage() {
  const students = await prisma.profile.findMany({
    where: { role: "student" },
    include: {
      _count: { select: { enrollments: true } },
      parent: { select: { fullName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const mapped: StudentRecord[] = students.map((s) => ({
    id: s.id,
    email: s.email,
    fullName: s.fullName,
    avatarUrl: s.avatarUrl,
    xp: s.xp,
    level: s.level,
    currentStreak: s.currentStreak,
    createdAt: s.createdAt.toISOString(),
    enrolledCourses: s._count.enrollments,
    parentName: s.parent?.fullName ?? null,
  }));

  return <AdminStudentsClient students={mapped} />;
}
