import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { getStripeConfig, saveStripeConfig } from "@/lib/stripe";
import { createAuditLog } from "@/lib/audit-log";

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const config = await getStripeConfig();
  return NextResponse.json(config);
}

export async function PUT(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { enabled, secretKey, publishableKey, webhookSecret, currency } = body;

  await saveStripeConfig({ enabled, secretKey, publishableKey, webhookSecret, currency });

  await createAuditLog({
    action: "update",
    resource: "settings",
    userId: user.id,
    details: { stripe: { enabled: !!enabled } },
  });

  return NextResponse.json({ success: true });
}
