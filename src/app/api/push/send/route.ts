import { NextResponse } from "next/server";

import { getUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT ?? "mailto:admin@neot.app";

export async function POST(request: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = await prisma.profile.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (admin?.role !== "admin") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const body = await request.json();
  const { title, message, targetRole, link } = body;

  if (!title || !message) {
    return NextResponse.json({ error: "Title and message are required" }, { status: 400 });
  }

  const where: Record<string, unknown> = {};
  if (targetRole) {
    where.user = { role: targetRole };
  }

  const subscriptions = await prisma.pushSubscription.findMany({ where });

  if (subscriptions.length === 0) {
    return NextResponse.json({ success: true, sent: 0, message: "No subscriptions found" });
  }

  let sent = 0;
  const errors: string[] = [];

  for (const sub of subscriptions) {
    try {
      await sendPushNotification(sub, { title, message, link });
      sent++;
    } catch (err) {
      errors.push(`Failed to send to ${sub.endpoint.slice(0, 50)}...`);
    }
  }

  return NextResponse.json({ success: true, sent, errors });
}

async function sendPushNotification(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: { title: string; message: string; link?: string },
) {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.warn("VAPID keys not configured, skipping push notification");
    return;
  }

  const webpush = await import("web-push").catch(() => null);
  if (!webpush) {
    console.warn("web-push package not installed, skipping push notification");
    return;
  }

  webpush.setVapidDetails(
    VAPID_SUBJECT,
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY,
  );

  await webpush.default.sendNotification(
    {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth,
      },
    },
    JSON.stringify({
      title: payload.title,
      body: payload.message,
      icon: "/icon-192.png",
      badge: "/badge-72.png",
      data: { link: payload.link },
    }),
  );
}
