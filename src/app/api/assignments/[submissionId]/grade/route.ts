import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { z } from "zod";

const gradeSchema = z.object({
  score: z.number().min(0).max(1000),
  feedback: z.string().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ submissionId: string }> },
) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { submissionId } = await params;
  const body = await request.json();

  const parsed = gradeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const submission = await prisma.assignmentSubmission.findUnique({
    where: { id: submissionId },
    include: {
      user: { select: { id: true } },
    },
  });

  if (!submission) return NextResponse.json({ error: "Submission not found" }, { status: 404 });

  const lesson = await prisma.lesson.findUnique({
    where: { id: submission.lessonId },
    include: {
      module: { include: { course: { select: { teacherId: true } } } },
    },
  });

  if (!lesson || lesson.module.course.teacherId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.assignmentSubmission.update({
    where: { id: submissionId },
    data: {
      score: parsed.data.score,
      feedback: parsed.data.feedback ?? null,
      status: "graded",
      gradedAt: new Date(),
      gradedById: user.id,
    },
    include: {
      user: { select: { id: true, fullName: true, email: true } },
    },
  });

  return NextResponse.json({ submission: updated });
}
