import { NextRequest, NextResponse } from "next/server";

import { getUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.profile.findUnique({ where: { id: userId } });
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const config = await prisma.revenueShareConfig.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });

  const [totalPurchases, platformTotals, pendingPayouts] = await Promise.all([
    prisma.marketplacePurchase.aggregate({
      _sum: { price: true, platformFee: true, teacherCut: true },
      _count: { id: true },
    }),
    prisma.marketplacePurchase.groupBy({
      by: ["currency"],
      _sum: { price: true, platformFee: true, teacherCut: true },
    }),
    prisma.payoutTransaction.aggregate({
      where: { status: "pending" },
      _sum: { amount: true },
      _count: { id: true },
    }),
  ]);

  return NextResponse.json({
    config,
    summary: {
      totalRevenue: totalPurchases._sum.price ?? 0,
      totalPlatformFees: totalPurchases._sum.platformFee ?? 0,
      totalTeacherEarnings: totalPurchases._sum.teacherCut ?? 0,
      totalSales: totalPurchases._count.id ?? 0,
      pendingPayouts: pendingPayouts._sum.amount ?? 0,
      pendingCount: pendingPayouts._count.id ?? 0,
    },
    byCurrency: platformTotals,
  });
}

export async function PUT(request: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.profile.findUnique({ where: { id: userId } });
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { platformFee, minPayout, payoutMethod } = body;

  await prisma.revenueShareConfig.updateMany({
    where: { isActive: true },
    data: { isActive: false },
  });

  const config = await prisma.revenueShareConfig.create({
    data: {
      platformFee: platformFee ?? 20,
      minPayout: minPayout ?? 50,
      payoutMethod: payoutMethod ?? "manual",
      isActive: true,
    },
  });

  return NextResponse.json({ success: true, config });
}
