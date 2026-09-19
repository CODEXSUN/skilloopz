import { NextResponse } from "next/server";

import { getUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const teacher = await prisma.profile.findUnique({
    where: { id: userId, role: "teacher" },
  });

  if (!teacher) {
    return NextResponse.json({ error: "Teacher access required" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get("courseId");

  const courses = await prisma.course.findMany({
    where: { teacherId: userId, deletedAt: null, ...(courseId ? { id: courseId } : {}) },
    select: { id: true, title: true },
  });

  const courseIds = courses.map((c) => c.id);

  if (courseIds.length === 0) {
    return NextResponse.json({ courses: [], overallMastery: 0, skillBreakdown: [] });
  }

  const enrollments = await prisma.enrollment.findMany({
    where: { courseId: { in: courseIds } },
    select: { userId: true, courseId: true, progress: true },
  });

  const studentIds = [...new Set(enrollments.map((e) => e.userId))];

  const masteryRecords = await prisma.skillMastery.findMany({
    where: { userId: { in: studentIds } },
    include: { skill: true, user: { select: { fullName: true, avatarUrl: true } } },
  });

  const lessonSkills = await prisma.lessonSkill.findMany({
    where: { lesson: { module: { courseId: { in: courseIds } } } },
    select: { lessonId: true, skillId: true, weight: true },
  });

const lessons = await prisma.lesson.findMany({
    where: { module: { courseId: { in: courseIds } } },
    select: { id: true, moduleId: true, module: { select: { courseId: true } } },
  });

  const lessonCourseMap = new Map(lessons.map((l) => [l.id, l.module.courseId]));
  const lessonSkillMap = new Map<string, { skillId: string; weight: number }[]>();
  for (const ls of lessonSkills) {
    const existing = lessonSkillMap.get(ls.lessonId) ?? [];
    existing.push({ skillId: ls.skillId, weight: ls.weight });
    lessonSkillMap.set(ls.lessonId, existing);
  }

  const studentMasteryMap = new Map<string, Map<string, number>>();
  for (const record of masteryRecords) {
    if (!studentMasteryMap.has(record.userId)) {
      studentMasteryMap.set(record.userId, new Map());
    }
    studentMasteryMap.get(record.userId)!.set(record.skillId, record.score);
  }

  const skillScores: Map<string, number[]> = new Map();
  for (const record of masteryRecords) {
    if (!skillScores.has(record.skillId)) {
      skillScores.set(record.skillId, []);
    }
    skillScores.get(record.skillId)!.push(record.score);
  }

  const skillBreakdown = [];
  for (const [skillId, scores] of skillScores.entries()) {
    const skill = masteryRecords.find((r) => r.skillId === skillId)?.skill;
    if (!skill) continue;

    const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    const mastered = scores.filter((s) => s >= 0.75).length;
    const struggling = scores.filter((s) => s < 0.4).length;

    skillBreakdown.push({
      id: skillId,
      name: skill.name,
      icon: skill.icon,
      color: skill.color,
      category: skill.category,
      avgScore: Math.round(avg * 100),
      studentCount: scores.length,
      masteredCount: mastered,
      strugglingCount: struggling,
      masteryRate: Math.round((mastered / scores.length) * 100),
    });
  }

  skillBreakdown.sort((a, b) => b.avgScore - a.avgScore);

  const overallMastery = masteryRecords.length > 0
    ? Math.round((masteryRecords.reduce((sum, r) => sum + r.score, 0) / masteryRecords.length) * 100)
    : 0;

  const studentSummaries = studentIds.map((studentId) => {
    const studentRecords = masteryRecords.filter((r) => r.userId === studentId);
    const avgScore = studentRecords.length > 0
      ? Math.round((studentRecords.reduce((sum, r) => sum + r.score, 0) / studentRecords.length) * 100)
      : 0;

    const enrolledCourses = enrollments.filter((e) => e.userId === studentId).map((e) => e.courseId);
    const avgProgress = enrolledCourses.length > 0
      ? Math.round(enrollments.filter((e) => e.userId === studentId).reduce((sum, e) => sum + e.progress, 0) / enrolledCourses.length)
      : 0;

    return {
      id: studentId,
      fullName: studentRecords[0]?.user.fullName ?? null,
      avatarUrl: studentRecords[0]?.user.avatarUrl ?? null,
      avgScore,
      avgProgress,
      skillsTracked: studentRecords.length,
      masteredSkills: studentRecords.filter((r) => r.score >= 0.75).length,
      strugglingSkills: studentRecords.filter((r) => r.score < 0.4).length,
    };
  });

  studentSummaries.sort((a, b) => b.avgScore - a.avgScore);

  return NextResponse.json({
    courses,
    overallMastery,
    skillBreakdown,
    studentSummaries,
    totalStudents: studentIds.length,
    totalMasteryRecords: masteryRecords.length,
  });
}
