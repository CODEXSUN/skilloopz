import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { TeacherMessagesContent } from "@/components/teacher/teacher-messages-content";

export default async function TeacherMessagesPage() {
  const user = await getUser();
  if (!user) redirect("/login");
  if (user.role !== "teacher" && user.role !== "admin") redirect("/dashboard");

  let students: { id: string; fullName: string | null; email: string | null; courseTitle: string }[] = [];

  try {
    const enrollments = await prisma.enrollment.findMany({
      where: {
        course: { teacherId: user.id, deletedAt: null },
      },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        course: { select: { title: true } },
      },
      distinct: ["userId"],
    });

    students = enrollments.map((e) => ({
      id: e.user.id,
      fullName: e.user.fullName,
      email: e.user.email,
      courseTitle: e.course.title,
    }));
  } catch {
    // Students not available
  }

  return <TeacherMessagesContent students={students} />;
}
