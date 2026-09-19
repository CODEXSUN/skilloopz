import { prisma } from "@/lib/db";
import { AdminSchoolsClient } from "@/components/admin/schools/schools-client";

interface SchoolRecord {
  id: string;
  name: string;
  code: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  country: string | null;
  tier: string;
  status: string;
  maxStudents: number;
  currentStudents: number;
  contractStart: string | null;
  contractEnd: string | null;
  createdAt: string;
  teacherCount: number;
  studentCount: number;
  courseCount: number;
}

export default async function AdminSchoolsPage() {
  const schools = await prisma.school.findMany({
    orderBy: { createdAt: "desc" },
  });

  const schoolIds = schools.map((s) => s.id);

  const [teacherCounts, studentCounts, courseCounts] = await Promise.all([
    prisma.profile.groupBy({
      by: ["schoolId"],
      where: { schoolId: { in: schoolIds }, role: "teacher" },
      _count: { id: true },
    }),
    prisma.profile.groupBy({
      by: ["schoolId"],
      where: { schoolId: { in: schoolIds }, role: "student" },
      _count: { id: true },
    }),
    prisma.course.groupBy({
      by: ["schoolId"],
      where: { schoolId: { in: schoolIds }, deletedAt: null },
      _count: { id: true },
    }),
  ]);

  const teacherMap = new Map(teacherCounts.map((c) => [c.schoolId, c._count.id]));
  const studentMap = new Map(studentCounts.map((c) => [c.schoolId, c._count.id]));
  const courseMap = new Map(courseCounts.map((c) => [c.schoolId, c._count.id]));

  const mapped: SchoolRecord[] = schools.map((s) => ({
    id: s.id,
    name: s.name,
    code: s.code,
    email: s.email,
    phone: s.phone,
    city: s.city,
    country: s.country,
    tier: s.tier,
    status: s.status,
    maxStudents: s.maxStudents,
    currentStudents: s.currentStudents,
    contractStart: s.contractStart?.toISOString() ?? null,
    contractEnd: s.contractEnd?.toISOString() ?? null,
    createdAt: s.createdAt.toISOString(),
    teacherCount: teacherMap.get(s.id) ?? 0,
    studentCount: studentMap.get(s.id) ?? 0,
    courseCount: courseMap.get(s.id) ?? 0,
  }));

  return <AdminSchoolsClient schools={mapped} />;
}
