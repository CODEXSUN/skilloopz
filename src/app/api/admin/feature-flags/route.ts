import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { getAllFlags, toggleFlag, ensureDefaultFlags } from "@/lib/feature-flags";

const toggleSchema = z.object({
  key: z.string().min(1),
  enabled: z.boolean(),
});

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await ensureDefaultFlags();
  const flags = await getAllFlags();
  return NextResponse.json(flags);
}

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const parsed = toggleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const existing = await prisma.featureFlag.findUnique({ where: { key: parsed.data.key } });
  if (!existing) {
    return NextResponse.json({ error: `Flag "${parsed.data.key}" not found` }, { status: 404 });
  }

  const flag = await toggleFlag(parsed.data.key, parsed.data.enabled);
  return NextResponse.json(flag);
}
