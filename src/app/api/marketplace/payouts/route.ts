import { NextRequest, NextResponse } from "next/server";

import { getUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const transactions = await prisma.payoutTransaction.findMany({
    where: { teacherId: userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ transactions });
}

export async function POST() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const config = await prisma.revenueShareConfig.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });

  const aggregation = await prisma.marketplacePurchase.aggregate({
    where: { teacherId: userId },
    _sum: { teacherCut: true },
  });

  const totalEarnings = aggregation._sum.teacherCut ?? 0;

  const previousPayouts = await prisma.payoutTransaction.aggregate({
    where: { teacherId: userId, status: "completed" },
    _sum: { amount: true },
  });

  const paidOut = previousPayouts._sum.amount ?? 0;
  const available = totalEarnings - paidOut;
  const minPayout = config?.minPayout ?? 50;

  if (available < minPayout) {
    return NextResponse.json({
      error: `Minimum payout is $${minPayout}. You have $${available.toFixed(2)} available.`,
    }, { status: 400 });
  }

  const account = await prisma.payoutAccount.findFirst({
    where: { teacherId: userId },
  });

  if (!account) {
    return NextResponse.json({ error: "Set up a payout account first" }, { status: 400 });
  }

  const payout = await prisma.payoutTransaction.create({
    data: {
      teacherId: userId,
      amount: available,
      status: "pending",
      method: account.method,
      description: `Payout of $${available.toFixed(2)}`,
    },
  });

  return NextResponse.json({ success: true, payout }, { status: 201 });
}
