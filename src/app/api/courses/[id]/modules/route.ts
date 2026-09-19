import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const modules = await prisma.module.findMany({
    where: { courseId: id },
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { lessons: true } },
    },
  });

  return NextResponse.json(modules);
}
