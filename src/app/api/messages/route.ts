import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getUserId } from "@/lib/auth";
import { csrfGuard } from "@/lib/csrf";
import { NOTIFICATION_TYPES } from "@/lib/notifications";
import { createAuditLog } from "@/lib/audit-log";

const sendMessageSchema = z.object({
  recipientId: z.string(),
  subject: z.string().min(1).max(200),
  content: z.string().min(1).max(5000),
});

export async function POST(request: Request) {
  const csrfError = csrfGuard(request);
  if (csrfError) return csrfError;

  const senderId = await getUserId();
  if (!senderId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = sendMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { recipientId, subject, content } = parsed.data;

  const recipient = await prisma.profile.findUnique({
    where: { id: recipientId },
    select: { id: true, role: true },
  });

  if (!recipient) {
    return NextResponse.json({ error: "Recipient not found" }, { status: 404 });
  }

  const sender = await prisma.profile.findUnique({
    where: { id: senderId },
    select: { id: true, fullName: true, role: true },
  });

  // Allow parents to message teachers, teachers to message students, admins to message anyone
  if (sender?.role === "parent") {
    if (recipient.role !== "teacher" && recipient.role !== "admin") {
      return NextResponse.json({ error: "Parents can only message teachers and admins" }, { status: 403 });
    }
  } else if (sender?.role === "teacher") {
    if (recipient.role !== "student" && recipient.role !== "parent" && recipient.role !== "admin") {
      return NextResponse.json({ error: "Teachers can only message students, parents, and admins" }, { status: 403 });
    }
  } else if (sender?.role !== "admin") {
    return NextResponse.json({ error: "Only teachers, parents, and admins can send messages" }, { status: 403 });
  }

  const message = await prisma.message.create({
    data: {
      senderId,
      recipientId,
      subject,
      content,
    },
  });

  await prisma.notification.create({
    data: {
      userId: recipientId,
      type: NOTIFICATION_TYPES.MESSAGE,
      title: `Message from ${sender?.fullName ?? "Teacher"}`,
      message: subject,
      link: "/dashboard/messages",
    },
  });

  await createAuditLog({
    action: "create",
    resource: "message",
    resourceId: message.id,
    userId: senderId,
    details: { recipientId, subject },
  });

  return NextResponse.json({ success: true, messageId: message.id }, { status: 201 });
}

export async function GET(request: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const skip = (page - 1) * limit;

  const [messages, total] = await Promise.all([
    prisma.message.findMany({
      where: { recipientId: userId },
      include: {
        sender: { select: { id: true, fullName: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.message.count({ where: { recipientId: userId } }),
  ]);

  return NextResponse.json({
    messages: messages.map((m) => ({
      id: m.id,
      subject: m.subject,
      content: m.content,
      readAt: m.readAt,
      createdAt: m.createdAt,
      sender: {
        id: m.sender.id,
        fullName: m.sender.fullName,
        role: m.sender.role,
      },
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
