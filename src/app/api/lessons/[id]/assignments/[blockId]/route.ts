import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; blockId: string }> },
) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, blockId } = await params;

  try {
    const submission = await prisma.assignmentSubmission.findUnique({
      where: {
        lessonId_userId_blockId: { lessonId: id, userId: user.id, blockId },
      },
    });

    return NextResponse.json({ submission });
  } catch {
    return NextResponse.json({ submission: null });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; blockId: string }> },
) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, blockId } = await params;
  const body = await request.json();

  const { content, fileUrl } = body as { content?: string; fileUrl?: string };

  if (!content?.trim() && !fileUrl) {
    return NextResponse.json({ error: "Content or file is required" }, { status: 400 });
  }

  try {
    const submission = await prisma.assignmentSubmission.upsert({
      where: {
        lessonId_userId_blockId: { lessonId: id, userId: user.id, blockId },
      },
      update: {
        content: JSON.stringify({ text: content }),
        fileUrl: fileUrl ?? null,
        status: "submitted",
        score: null,
        feedback: null,
        gradedAt: null,
      },
      create: {
        lessonId: id,
        userId: user.id,
        blockId,
        content: JSON.stringify({ text: content }),
        fileUrl: fileUrl ?? null,
        status: "submitted",
      },
    });

    return NextResponse.json({ submission }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to submit assignment" },
      { status: 500 },
    );
  }
}
