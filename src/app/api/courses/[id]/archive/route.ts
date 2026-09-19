import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { courseId, action } = body;

  if (!courseId || !action || !["archive", "restore"].includes(action)) {
    return NextResponse.json(
      { error: "courseId and action (archive|restore) are required" },
      { status: 400 },
    );
  }

  const course = await prisma.course.findFirst({
    where: { id: courseId },
  });

  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  if (course.teacherId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (action === "archive") {
    if (course.deletedAt) {
      return NextResponse.json({ error: "Course is already archived" }, { status: 409 });
    }

    await prisma.course.update({
      where: { id: courseId },
      data: { deletedAt: new Date(), status: "archived" },
    });

    return NextResponse.json({ success: true, action: "archived" });
  }

  if (action === "restore") {
    if (!course.deletedAt) {
      return NextResponse.json({ error: "Course is not archived" }, { status: 409 });
    }

    await prisma.course.update({
      where: { id: courseId },
      data: { deletedAt: null, status: "draft" },
    });

    return NextResponse.json({ success: true, action: "restored" });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
