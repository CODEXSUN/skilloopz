import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";

const updateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  url: z.string().url().optional(),
  events: z.array(z.string()).min(1).optional(),
  active: z.boolean().optional(),
  secret: z.string().max(500).optional(),
  timeoutMs: z.number().min(1000).max(30000).optional(),
  retryCount: z.number().min(0).max(10).optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  const existing = await prisma.webhook.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Webhook not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) data.name = parsed.data.name;
  if (parsed.data.url !== undefined) data.url = parsed.data.url;
  if (parsed.data.events !== undefined) data.events = JSON.stringify(parsed.data.events);
  if (parsed.data.active !== undefined) data.active = parsed.data.active;
  if (parsed.data.secret !== undefined) data.secret = parsed.data.secret || null;
  if (parsed.data.timeoutMs !== undefined) data.timeoutMs = parsed.data.timeoutMs;
  if (parsed.data.retryCount !== undefined) data.retryCount = parsed.data.retryCount;

  const webhook = await prisma.webhook.update({
    where: { id },
    data,
  });

  return NextResponse.json(webhook);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  const existing = await prisma.webhook.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Webhook not found" }, { status: 404 });
  }

  await prisma.webhook.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
