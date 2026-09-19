import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendTeacherMessage } from "@/lib/notifications";

export async function POST(request: Request) {
  const user = await getUser();
  if (!user || user.role !== "teacher") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { courseId, studentIds, subject, body: messageBody } = body;

    if (!subject || !messageBody) {
      return NextResponse.json(
        { error: "Subject and message body are required" },
        { status: 400 },
      );
    }

    let targets: string[] = studentIds;

    if (courseId && !studentIds?.length) {
      const enrollments = await prisma.enrollment.findMany({
        where: {
          courseId,
          course: { teacherId: user.id },
          archived: false,
        },
        select: { userId: true },
      });
      targets = enrollments.map((e) => e.userId);
    }

    if (!targets.length) {
      return NextResponse.json(
        { error: "No students to notify" },
        { status: 400 },
      );
    }

    await sendTeacherMessage(user.id, targets, subject, messageBody, courseId);

    return NextResponse.json({
      success: true,
      sent: targets.length,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 },
    );
  }
}
