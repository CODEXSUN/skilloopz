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

  const payouts = await prisma.payoutTransaction.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ payouts });
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
  const { payoutId, action } = body;

  if (!payoutId || !action) {
    return NextResponse.json({ error: "payoutId and action are required" }, { status: 400 });
  }

  if (action === "approve") {
    await prisma.payoutTransaction.update({
      where: { id: payoutId },
      data: { status: "completed", paidAt: new Date() },
    });
  } else if (action === "reject") {
    await prisma.payoutTransaction.update({
      where: { id: payoutId },
      data: { status: "rejected" },
    });
  } else {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
