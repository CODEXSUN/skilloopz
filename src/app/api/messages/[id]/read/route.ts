import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserId } from "@/lib/auth";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const message = await prisma.message.findUnique({
    where: { id },
  });

  if (!message || message.recipientId !== userId) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }

  const updated = await prisma.message.update({
    where: { id },
    data: { readAt: new Date() },
    include: {
      sender: { select: { id: true, fullName: true, role: true } },
    },
  });

  return NextResponse.json({
    id: updated.id,
    subject: updated.subject,
    content: updated.content,
    readAt: updated.readAt,
    createdAt: updated.createdAt,
    sender: {
      id: updated.sender.id,
      fullName: updated.sender.fullName,
      role: updated.sender.role,
    },
  });
}
