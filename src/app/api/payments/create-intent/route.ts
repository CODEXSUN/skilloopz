import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStripeConfig, createPaymentIntent } from "@/lib/stripe";

export async function POST(request: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { listingId } = await request.json();
  if (!listingId) return NextResponse.json({ error: "Listing ID required" }, { status: 400 });

  const config = await getStripeConfig();
  if (!config.enabled || !config.secretKey) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
  }

  const listing = await prisma.marketplaceListing.findUnique({ where: { id: listingId } });
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

  const { clientSecret, paymentIntentId } = await createPaymentIntent(config, listing.price, {
    userId,
    listingId,
    teacherId: listing.teacherId,
  });

  const payment = await prisma.payment.create({
    data: {
      userId,
      amount: listing.price,
      currency: config.currency,
      status: "pending",
      stripeIntentId: paymentIntentId,
      listingId,
      metadata: JSON.stringify({ teacherId: listing.teacherId }),
    },
  });

  return NextResponse.json({
    clientSecret,
    paymentIntentId,
    paymentId: payment.id,
    amount: listing.price,
  });
}
