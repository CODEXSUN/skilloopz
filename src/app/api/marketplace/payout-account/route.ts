import { NextRequest, NextResponse } from "next/server";

import { getUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accounts = await prisma.payoutAccount.findMany({
    where: { teacherId: userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ accounts });
}

export async function PUT(request: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { method, accountName, accountEmail, bankName, bankAccount, routingNumber } = body;

  if (!method) {
    return NextResponse.json({ error: "Payout method is required" }, { status: 400 });
  }

  const account = await prisma.payoutAccount.upsert({
    where: { teacherId_method: { teacherId: userId, method } },
    update: {
      accountName: accountName ?? null,
      accountEmail: accountEmail ?? null,
      bankName: bankName ?? null,
      bankAccount: bankAccount ?? null,
      routingNumber: routingNumber ?? null,
    },
    create: {
      teacherId: userId,
      method,
      accountName: accountName ?? null,
      accountEmail: accountEmail ?? null,
      bankName: bankName ?? null,
      bankAccount: bankAccount ?? null,
      routingNumber: routingNumber ?? null,
    },
  });

  return NextResponse.json({ success: true, account });
}
