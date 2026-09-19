import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const lessonId = searchParams.get("lessonId");

  const where = lessonId ? { userId, lessonId } : { userId };

  const bookmarks = await prisma.bookmark.findMany({
    where,
    include: {
      lesson: {
        select: {
          id: true,
          title: true,
          module: {
            select: {
              courseId: true,
              course: { select: { id: true, title: true, thumbnailUrl: true } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ bookmarks });
}

export async function POST(request: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { lessonId } = body;

  if (!lessonId) {
    return NextResponse.json({ error: "Lesson ID is required" }, { status: 400 });
  }

  const existing = await prisma.bookmark.findUnique({
    where: { userId_lessonId: { userId, lessonId } },
  });

  if (existing) {
    return NextResponse.json({ error: "Already bookmarked" }, { status: 409 });
  }

  const bookmark = await prisma.bookmark.create({
    data: { userId, lessonId },
  });

  return NextResponse.json({ bookmark }, { status: 201 });
}

export async function DELETE(request: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const lessonId = searchParams.get("lessonId");

  if (!lessonId) {
    return NextResponse.json({ error: "Lesson ID is required" }, { status: 400 });
  }

  await prisma.bookmark.deleteMany({
    where: { userId, lessonId },
  });

  return NextResponse.json({ success: true });
}
