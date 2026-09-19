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

  const [purchases, total, aggregation] = await Promise.all([
    prisma.marketplacePurchase.findMany({
      where: { teacherId: userId },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        listing: { select: { title: true } },
      },
    }),
    prisma.marketplacePurchase.count({ where: { teacherId: userId } }),
    prisma.marketplacePurchase.aggregate({
      where: { teacherId: userId },
      _sum: { teacherCut: true, platformFee: true, price: true },
      _count: { id: true },
    }),
  ]);

  return NextResponse.json({
    purchases,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    summary: {
      totalRevenue: aggregation._sum.price ?? 0,
      totalEarnings: aggregation._sum.teacherCut ?? 0,
      totalFees: aggregation._sum.platformFee ?? 0,
      totalSales: aggregation._count.id ?? 0,
    },
  });
}
