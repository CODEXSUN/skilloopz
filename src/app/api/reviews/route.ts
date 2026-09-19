import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getUserId } from "@/lib/auth";
import { csrfGuard } from "@/lib/csrf";

const createReviewSchema = z.object({
  courseId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

export async function POST(request: Request) {
  const csrfError = csrfGuard(request);
  if (csrfError) return csrfError;

  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createReviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { courseId, rating, comment } = parsed.data;

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });

  if (!enrollment) {
    return NextResponse.json({ error: "Must be enrolled to review" }, { status: 403 });
  }

  const existing = await prisma.review.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });

  if (existing) {
    return NextResponse.json({ error: "Already reviewed this course" }, { status: 409 });
  }

  const review = await prisma.review.create({
    data: {
      userId,
      courseId,
      rating,
      comment: comment ?? null,
    },
    include: {
      user: { select: { fullName: true } },
    },
  });

  return NextResponse.json({ success: true, review }, { status: 201 });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get("courseId");

  if (!courseId) {
    return NextResponse.json({ error: "courseId required" }, { status: 400 });
  }

  const reviews = await prisma.review.findMany({
    where: { courseId, approved: true },
    include: {
      user: { select: { fullName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const avgRating = await prisma.review.aggregate({
    where: { courseId, approved: true },
    _avg: { rating: true },
    _count: true,
  });

  return NextResponse.json({
    reviews: reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt.toISOString(),
      user: { fullName: r.user.fullName },
    })),
    avgRating: avgRating._avg.rating ?? 0,
    totalCount: avgRating._count,
  });
}
