import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { ALL_WEBHOOK_EVENTS } from "@/lib/webhook-events";

const upsertSchema = z.object({
  name: z.string().min(1).max(200),
  url: z.string().url(),
  events: z.array(z.string()).min(1),
  active: z.boolean().optional().default(true),
  secret: z.string().max(500).optional().default(""),
  timeoutMs: z.number().min(1000).max(30000).optional().default(5000),
  retryCount: z.number().min(0).max(10).optional().default(3),
});

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const webhooks = await prisma.webhook.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(webhooks);
}

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const parsed = upsertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const invalid = parsed.data.events.filter((e) => e !== "*" && !ALL_WEBHOOK_EVENTS.includes(e as never));
  if (invalid.length > 0) {
    return NextResponse.json({ error: `Invalid events: ${invalid.join(", ")}` }, { status: 400 });
  }

  const webhook = await prisma.webhook.create({
    data: {
      name: parsed.data.name,
      url: parsed.data.url,
      events: JSON.stringify(parsed.data.events),
      active: parsed.data.active,
      secret: parsed.data.secret || null,
      timeoutMs: parsed.data.timeoutMs,
      retryCount: parsed.data.retryCount,
    },
  });

  return NextResponse.json(webhook, { status: 201 });
}
