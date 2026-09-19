import { NextResponse } from "next/server";

import { getUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const userId = await getUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const enrollments = await prisma.enrollment.findMany({
    where: {
      userId,
      course: { deletedAt: null },
    },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          thumbnailUrl: true,
          difficulty: true,
          estimatedMinutes: true,
          teacher: { select: { fullName: true } },
          _count: { select: { modules: true } },
        },
      },
    },
    orderBy: { startedAt: "desc" },
  });

  return NextResponse.json(enrollments);
}
