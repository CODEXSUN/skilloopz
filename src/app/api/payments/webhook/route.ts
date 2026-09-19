import { NextResponse } from "next/server";
import { getStripeConfig, handleWebhookEvent } from "@/lib/stripe";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const config = await getStripeConfig();
  if (!config.enabled || !config.webhookSecret) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
  }

  let event: { type: string; data: Record<string, unknown> };
  try {
    event = await handleWebhookEvent(config, rawBody, signature);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const { type, data } = event;

  if (type === "payment_intent.succeeded") {
    const intent = data as { id: string; metadata?: Record<string, string> };
    const { userId, listingId, teacherId } = intent.metadata || {};

    if (listingId && userId) {
      const listing = await prisma.marketplaceListing.findUnique({ where: { id: listingId } });
      if (!listing) {
        return NextResponse.json({ received: true });
      }

      const paymentConfig = await prisma.revenueShareConfig.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
      });

      const platformFeePct = paymentConfig?.platformFee ?? 20;
      const platformFee = listing.price * (platformFeePct / 100);
      const teacherCut = listing.price - platformFee;

      const purchase = await prisma.marketplacePurchase.create({
        data: {
          listingId,
          buyerId: userId,
          teacherId: teacherId || listing.teacherId,
          price: listing.price,
          platformFee,
          teacherCut,
          status: "completed",
          metadata: JSON.stringify({ stripeIntentId: intent.id }),
        },
      });

      await prisma.payment.updateMany({
        where: { stripeIntentId: intent.id },
        data: {
          status: "completed",
          stripeChargeId: intent.id,
          purchaseId: purchase.id,
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
    }
  }

  if (type === "payment_intent.payment_failed") {
    const intent = data as { id: string; last_payment_error?: { message?: string } };

    await prisma.payment.updateMany({
      where: { stripeIntentId: intent.id },
      data: {
        status: "failed",
        errorMessage: intent.last_payment_error?.message || "Payment failed",
      },
    });
  }

  return NextResponse.json({ received: true });
}
