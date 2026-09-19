import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";

const updateThemeSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  isActive: z.boolean().optional(),
  tokens: z.string().optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  const theme = await prisma.siteTheme.findUnique({ where: { id } });
  if (!theme) {
    return NextResponse.json({ error: "Theme not found" }, { status: 404 });
  }

  return NextResponse.json(theme);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  const existing = await prisma.siteTheme.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Theme not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = updateThemeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  if (parsed.data.isActive) {
    await prisma.siteTheme.updateMany({
      where: { id: { not: id } },
      data: { isActive: false },
    });
  }

  const theme = await prisma.siteTheme.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json(theme);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  const existing = await prisma.siteTheme.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Theme not found" }, { status: 404 });
  }

  await prisma.siteTheme.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
