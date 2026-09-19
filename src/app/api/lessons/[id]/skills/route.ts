import { NextResponse } from "next/server";
import { z } from "zod";

import { getUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";

const addSkillSchema = z.object({
  skillId: z.string().uuid(),
  weight: z.number().min(0.1).max(2.0).default(1.0),
});

const updateSkillSchema = z.object({
  weight: z.number().min(0.1).max(2.0),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: {
      module: { select: { course: { select: { teacherId: true } } } },
    },
  });

  if (!lesson || lesson.module.course.teacherId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const skills = await prisma.lessonSkill.findMany({
    where: { lessonId: id },
    include: { skill: true },
    orderBy: { weight: "desc" },
  });

  const allSkills = await prisma.skill.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  return NextResponse.json({
    mapped: skills.map((s) => ({
      id: s.skillId,
      name: s.skill.name,
      description: s.skill.description,
      category: s.skill.category,
      icon: s.skill.icon,
      color: s.skill.color,
      weight: s.weight,
    })),
    available: allSkills.filter(
      (s) => !skills.some((ls) => ls.skillId === s.id),
    ),
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: {
      module: { select: { course: { select: { teacherId: true } } } },
    },
  });

  if (!lesson || lesson.module.course.teacherId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = addSkillSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const existing = await prisma.lessonSkill.findUnique({
    where: { lessonId_skillId: { lessonId: id, skillId: parsed.data.skillId } },
  });

  if (existing) {
    return NextResponse.json({ error: "Skill already mapped" }, { status: 409 });
  }

  const result = await prisma.lessonSkill.create({
    data: {
      lessonId: id,
      skillId: parsed.data.skillId,
      weight: parsed.data.weight,
    },
    include: { skill: true },
  });

  return NextResponse.json({
    id: result.skillId,
    name: result.skill.name,
    description: result.skill.description,
    category: result.skill.category,
    icon: result.skill.icon,
    color: result.skill.color,
    weight: result.weight,
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: {
      module: { select: { course: { select: { teacherId: true } } } },
    },
  });

  if (!lesson || lesson.module.course.teacherId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = updateSkillSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { skillId } = await request.json();

  if (!skillId) {
    return NextResponse.json({ error: "skillId required" }, { status: 400 });
  }

  const result = await prisma.lessonSkill.update({
    where: { lessonId_skillId: { lessonId: id, skillId } },
    data: { weight: parsed.data.weight },
    include: { skill: true },
  });

  return NextResponse.json({
    id: result.skillId,
    name: result.skill.name,
    weight: result.weight,
  });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: {
      module: { select: { course: { select: { teacherId: true } } } },
    },
  });

  if (!lesson || lesson.module.course.teacherId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const skillId = searchParams.get("skillId");

  if (!skillId) {
    return NextResponse.json({ error: "skillId required" }, { status: 400 });
  }

  await prisma.lessonSkill.delete({
    where: { lessonId_skillId: { lessonId: id, skillId } },
  });

  return NextResponse.json({ success: true });
}
