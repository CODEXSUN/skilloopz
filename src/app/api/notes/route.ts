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

  const notes = await prisma.lessonNote.findMany({
    where,
    include: {
      lesson: {
        select: {
          id: true,
          title: true,
          module: {
            select: {
              courseId: true,
              course: { select: { id: true, title: true } },
            },
          },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ notes });
}

export async function POST(request: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { lessonId, content, blockId } = body;

  if (!lessonId || !content?.trim()) {
    return NextResponse.json(
      { error: "Lesson ID and content are required" },
      { status: 400 },
    );
  }

  const note = await prisma.lessonNote.create({
    data: { userId, lessonId, content: content.trim(), blockId: blockId || null },
    include: {
      lesson: {
        select: {
          title: true,
          module: { select: { course: { select: { title: true } } } },
        },
      },
    },
  });

  return NextResponse.json({ note }, { status: 201 });
}

export async function PATCH(request: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id, content } = body;

  if (!id || !content?.trim()) {
    return NextResponse.json(
      { error: "Note ID and content are required" },
      { status: 400 },
    );
  }

  const updated = await prisma.lessonNote.updateMany({
    where: { id, userId },
    data: { content: content.trim() },
  });

  if (updated.count === 0) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Note ID is required" }, { status: 400 });
  }

  const deleted = await prisma.lessonNote.deleteMany({
    where: { id, userId },
  });

  if (deleted.count === 0) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
