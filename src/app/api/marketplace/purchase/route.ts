import { NextRequest, NextResponse } from "next/server";

import { getUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStripeConfig } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { listingId } = await request.json();
  if (!listingId) {
    return NextResponse.json({ error: "Listing ID is required" }, { status: 400 });
  }

  const listing = await prisma.marketplaceListing.findUnique({
    where: { id: listingId },
  });

  if (!listing || listing.status !== "published") {
    return NextResponse.json({ error: "Listing not available" }, { status: 404 });
  }

  if (listing.teacherId === userId) {
    return NextResponse.json({ error: "Cannot purchase your own course" }, { status: 400 });
  }

  const existingPurchase = await prisma.marketplacePurchase.findFirst({
    where: { listingId, buyerId: userId },
  });

  if (existingPurchase) {
    return NextResponse.json({ error: "Already purchased" }, { status: 400 });
  }

  const stripeConfig = await getStripeConfig();

  if (stripeConfig.enabled && stripeConfig.secretKey) {
    return NextResponse.json({
      checkout: true,
      checkoutUrl: `/checkout?listingId=${listingId}`,
      amount: listing.price,
    });
  }

  const config = await prisma.revenueShareConfig.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });

  const platformFeePct = config?.platformFee ?? 20;
  const platformFee = listing.price * (platformFeePct / 100);
  const teacherCut = listing.price - platformFee;

  const purchase = await prisma.marketplacePurchase.create({
    data: {
      listingId,
      buyerId: userId,
      teacherId: listing.teacherId,
      price: listing.price,
      platformFee,
      teacherCut,
      status: "completed",
    },
  });

  await prisma.enrollment.create({
    data: {
      userId,
      courseId: listing.courseId,
      progress: 0,
      completed: false,
    },
  });

  await prisma.marketplaceListing.update({
    where: { id: listingId },
    data: { purchaseCount: { increment: 1 } },
  });

  return NextResponse.json({ success: true, purchase }, { status: 201 });
}
