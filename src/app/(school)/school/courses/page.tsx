import Link from "next/link";
import { BookOpen, Plus, Users, Eye } from "lucide-react";

import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function SchoolCoursesPage() {
  const user = await getUser();
  if (!user || !user.schoolId) return null;

  const courses = await prisma.course.findMany({
    where: { schoolId: user.schoolId, deletedAt: null },
    include: {
      teacher: { select: { fullName: true, email: true } },
      _count: {
        select: { enrollments: true, modules: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
            School Courses
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage courses for your school.
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/teacher/courses/new">
            <Plus className="h-4 w-4" />
            Create Course
          </Link>
        </Button>
      </div>

      {courses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground/40" />
            <p className="mt-4 text-muted-foreground">No courses yet.</p>
            <Button asChild className="mt-4 gap-2">
              <Link href="/teacher/courses/new">
                <Plus className="h-4 w-4" />
                Create Your First Course
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <CardTitle className="truncate text-lg">{course.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {course.teacher.fullName ?? course.teacher.email}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={course.status === "published" ? "default" : "secondary"}
                    className="shrink-0"
                  >
                    {course.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {course._count.enrollments}
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    {course._count.modules} modules
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button asChild variant="outline" size="sm" className="flex-1 gap-1">
                    <Link href={`/courses/${course.id}`}>
                      <Eye className="h-3 w-3" />
                      View
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="flex-1 gap-1">
                    <Link href={`/teacher/courses/${course.id}/edit`}>
                      Edit
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
