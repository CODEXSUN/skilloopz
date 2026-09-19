import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";

export async function GET() {
  const theme = await prisma.siteTheme.findFirst({
    where: { isActive: true },
  });

  if (!theme) {
    return NextResponse.json({ error: "No active theme" }, { status: 404 });
  }

  return NextResponse.json(theme);
}

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const parsed = z.object({ id: z.string().uuid() }).safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid theme ID" }, { status: 400 });
  }

  const theme = await prisma.siteTheme.findUnique({ where: { id: parsed.data.id } });
  if (!theme) {
    return NextResponse.json({ error: "Theme not found" }, { status: 404 });
  }

  await prisma.siteTheme.updateMany({ data: { isActive: false } });
  await prisma.siteTheme.update({
    where: { id: parsed.data.id },
    data: { isActive: true },
  });

  return NextResponse.json({ success: true });
}
