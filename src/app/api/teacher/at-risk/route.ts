import { NextResponse } from "next/server";

import { getUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";

const RISK_THRESHOLDS = {
  daysInactive: 7,
  lowCompletionRate: 0.2,
  lowQuizScore: 40,
  lowMasteryScore: 0.3,
  decliningStreak: true,
};

interface RiskFactor {
  type: string;
  severity: "low" | "medium" | "high";
  message: string;
}

interface AtRiskStudent {
  id: string;
  fullName: string | null;
  avatarUrl: string | null;
  email: string | null;
  riskScore: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  riskFactors: RiskFactor[];
  lastActive: string | null;
  courseProgress: number;
  avgQuizScore: number | null;
  streak: number;
  enrolledCourses: number;
}

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

  const courses = await prisma.course.findMany({
    where: { teacherId: userId, deletedAt: null },
    select: { id: true },
  });

  const courseIds = courses.map((c) => c.id);

  if (courseIds.length === 0) {
    return NextResponse.json({ students: [], totalStudents: 0 });
  }

  const enrollments = await prisma.enrollment.findMany({
    where: { courseId: { in: courseIds } },
    include: {
      user: { select: { id: true, fullName: true, avatarUrl: true, email: true, currentStreak: true, xp: true, level: true } },
      course: { select: { id: true } },
    },
  });

  const studentMap = new Map<string, {
    user: typeof enrollments[number]["user"];
    enrollments: typeof enrollments;
  }>();

  for (const enrollment of enrollments) {
    const existing = studentMap.get(enrollment.userId);
    if (existing) {
      existing.enrollments.push(enrollment);
    } else {
      studentMap.set(enrollment.userId, { user: enrollment.user, enrollments: [enrollment] });
    }
  }

  const students: AtRiskStudent[] = [];

  for (const [studentId, data] of studentMap) {
    const riskFactors: RiskFactor[] = [];
    let riskScore = 0;

    const lastActivity = await prisma.lessonProgress.findFirst({
      where: { userId: studentId },
      orderBy: { updatedAt: "desc" },
      select: { updatedAt: true },
    });

    const daysInactive = lastActivity
      ? Math.floor((Date.now() - lastActivity.updatedAt.getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    if (daysInactive >= RISK_THRESHOLDS.daysInactive) {
      const severity = daysInactive >= 14 ? "high" : daysInactive >= 7 ? "medium" : "low";
      riskFactors.push({
        type: "inactive",
        severity,
        message: `No activity for ${daysInactive} days`,
      });
      riskScore += severity === "high" ? 30 : severity === "medium" ? 20 : 10;
    }

    const avgProgress = data.enrollments.reduce((sum, e) => sum + e.progress, 0) / data.enrollments.length;

    if (avgProgress < RISK_THRESHOLDS.lowCompletionRate * 100) {
      riskFactors.push({
        type: "low_progress",
        severity: avgProgress < 10 ? "high" : "medium",
        message: `Average course progress: ${Math.round(avgProgress)}%`,
      });
      riskScore += avgProgress < 10 ? 25 : 15;
    }

    const lessonScores = await prisma.lessonProgress.findMany({
      where: { userId: studentId, score: { not: null } },
      select: { score: true },
      take: 20,
    });

    const avgScore = lessonScores.length > 0
      ? lessonScores.reduce((sum, lp) => sum + (lp.score ?? 0), 0) / lessonScores.length
      : null;

    if (avgScore !== null && avgScore < RISK_THRESHOLDS.lowQuizScore) {
      riskFactors.push({
        type: "low_scores",
        severity: avgScore < 25 ? "high" : "medium",
        message: `Average quiz score: ${Math.round(avgScore)}%`,
      });
      riskScore += avgScore < 25 ? 25 : 15;
    }

    const masteryRecords = await prisma.skillMastery.findMany({
      where: { userId: studentId },
      select: { score: true },
    });

    if (masteryRecords.length > 0) {
      const avgMastery = masteryRecords.reduce((sum, m) => sum + m.score, 0) / masteryRecords.length;
      if (avgMastery < RISK_THRESHOLDS.lowMasteryScore) {
        riskFactors.push({
          type: "low_mastery",
          severity: "medium",
          message: `Average skill mastery: ${Math.round(avgMastery * 100)}%`,
        });
        riskScore += 15;
      }
    }

    if (data.user.currentStreak === 0 && daysInactive > 3) {
      riskFactors.push({
        type: "streak_lost",
        severity: "low",
        message: "Learning streak lost",
      });
      riskScore += 5;
    }

    const riskLevel = riskScore >= 60 ? "critical" : riskScore >= 40 ? "high" : riskScore >= 20 ? "medium" : "low";

    if (riskLevel !== "low") {
      students.push({
        id: studentId,
        fullName: data.user.fullName,
        avatarUrl: data.user.avatarUrl,
        email: data.user.email,
        riskScore,
        riskLevel,
        riskFactors,
        lastActive: lastActivity?.updatedAt.toISOString() ?? null,
        courseProgress: Math.round(avgProgress),
        avgQuizScore: avgScore ? Math.round(avgScore) : null,
        streak: data.user.currentStreak,
        enrolledCourses: data.enrollments.length,
      });
    }
  }

  students.sort((a, b) => b.riskScore - a.riskScore);

  return NextResponse.json({
    students,
    totalStudents: studentMap.size,
    atRiskCount: students.length,
  });
}
