import { NextRequest, NextResponse } from "next/server";

import { getUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");

  const [purchases, total] = await Promise.all([
    prisma.marketplacePurchase.findMany({
      where: { buyerId: userId },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.marketplacePurchase.count({ where: { buyerId: userId } }),
  ]);

  return NextResponse.json({
    purchases,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
