import { NextRequest, NextResponse } from "next/server";

import { getUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const subject = searchParams.get("subject");
  const topic = searchParams.get("topic");
  const difficulty = searchParams.get("difficulty");
  const type = searchParams.get("type");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");

  const where: Record<string, unknown> = {
    OR: [
      { createdBy: userId },
      { isPublic: true },
    ],
  };

  if (subject) where.subject = subject;
  if (topic) where.topic = { contains: topic };
  if (difficulty) where.difficulty = difficulty;
  if (type) where.type = type;

  const [questions, total] = await Promise.all([
    prisma.questionBank.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.questionBank.count({ where }),
  ]);

  return NextResponse.json({
    questions,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}

export async function POST(request: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { subject, topic, question, type, options, answer, explanation, hint, difficulty, tags, isPublic } = body;

  if (!subject || !topic || !question || !answer) {
    return NextResponse.json({ error: "Subject, topic, question, and answer are required" }, { status: 400 });
  }

  const created = await prisma.questionBank.create({
    data: {
      subject,
      topic,
      question,
      type: type ?? "mcq",
      options: JSON.stringify(options ?? []),
      answer,
      explanation: explanation ?? null,
      hint: hint ?? null,
      difficulty: difficulty ?? "medium",
      tags: JSON.stringify(tags ?? []),
      createdBy: userId,
      isPublic: isPublic ?? false,
    },
  });

  return NextResponse.json({ success: true, question: created }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id query parameter required" }, { status: 400 });
  }

  const existing = await prisma.questionBank.findUnique({
    where: { id },
    select: { createdBy: true },
  });

  if (!existing || existing.createdBy !== userId) {
    return NextResponse.json({ error: "Not found or not authorized" }, { status: 404 });
  }

  await prisma.questionBank.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
