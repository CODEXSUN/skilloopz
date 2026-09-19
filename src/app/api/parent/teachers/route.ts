import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserId } from "@/lib/auth";

export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.profile.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (profile?.role !== "parent") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Get children of this parent
  const children = await prisma.profile.findMany({
    where: {
      parentId: userId,
      role: "student",
    },
    select: { id: true },
  });

  if (children.length === 0) {
    return NextResponse.json({ teachers: [] });
  }

  const childIds = children.map((c) => c.id);

  // Get teachers of courses that children are enrolled in
  const teachers = await prisma.profile.findMany({
    where: {
      role: "teacher",
      courses: {
        some: {
          enrollments: {
            some: {
              userId: { in: childIds },
            },
          },
        },
      },
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      avatarUrl: true,
      metadata: true,
      courses: {
        where: {
          enrollments: {
            some: {
              userId: { in: childIds },
            },
          },
        },
        select: {
          id: true,
          title: true,
          subject: true,
        },
      },
    },
    orderBy: { fullName: "asc" },
  });

  return NextResponse.json({
    teachers: teachers.map((t) => ({
      id: t.id,
      fullName: t.fullName,
      email: t.email,
      avatarUrl: t.avatarUrl,
      subjects: (() => {
        try {
          const meta = JSON.parse(t.metadata);
          return meta.subjects ?? [];
        } catch {
          return [];
        }
      })(),
      courses: t.courses.map((c) => ({
        id: c.id,
        title: c.title,
        subject: c.subject,
      })),
    })),
  });
}
