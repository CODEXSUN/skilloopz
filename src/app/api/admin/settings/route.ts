import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const permError = await requirePermission(user.role, "settings", "read");
  if (permError) return permError;

  const settings = await prisma.platformSetting.findMany();
  return NextResponse.json(settings);
}

const upsertSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.string(),
  group: z.string().optional().default("general"),
});

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const permError = await requirePermission(user.role, "settings", "update");
  if (permError) return permError;

  const body = await request.json();

  if (Array.isArray(body)) {
    const parsed = z.array(upsertSchema).safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid settings data" }, { status: 400 });
    }

    for (const item of parsed.data) {
      await prisma.platformSetting.upsert({
        where: { key: item.key },
        create: { key: item.key, value: item.value, group: item.group },
        update: { value: item.value, group: item.group },
      });
    }

    const settings = await prisma.platformSetting.findMany();
    return NextResponse.json(settings);
  }

  const parsed = upsertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const setting = await prisma.platformSetting.upsert({
    where: { key: parsed.data.key },
    create: parsed.data,
    update: { value: parsed.data.value, group: parsed.data.group },
  });

  return NextResponse.json(setting);
}
