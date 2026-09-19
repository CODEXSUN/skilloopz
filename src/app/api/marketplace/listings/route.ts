import { NextRequest, NextResponse } from "next/server";

import { getUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const featured = searchParams.get("featured") === "true";
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "12");

  const where: Record<string, unknown> = {
    status: "published",
  };

  if (category) where.category = category;
  if (featured) where.featured = true;

  const [listings, total] = await Promise.all([
    prisma.marketplaceListing.findMany({
      where,
      orderBy: [{ featured: "desc" }, { purchaseCount: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.marketplaceListing.count({ where }),
  ]);

  return NextResponse.json({
    listings,
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
  const { courseId, title, description, price, currency, category, tags, thumbnailUrl, previewUrl } = body;

  if (!courseId || !title || !description) {
    return NextResponse.json({ error: "Course, title, and description are required" }, { status: 400 });
  }

  const existing = await prisma.marketplaceListing.findUnique({
    where: { courseId },
  });

  if (existing) {
    return NextResponse.json({ error: "Course already listed" }, { status: 400 });
  }

  const listing = await prisma.marketplaceListing.create({
    data: {
      courseId,
      teacherId: userId,
      title: title.trim(),
      description: description.trim(),
      price: price ?? 0,
      currency: currency ?? "USD",
      category: category ?? "general",
      tags: JSON.stringify(tags ?? []),
      thumbnailUrl: thumbnailUrl ?? null,
      previewUrl: previewUrl ?? null,
    },
  });

  return NextResponse.json({ success: true, listing }, { status: 201 });
}
