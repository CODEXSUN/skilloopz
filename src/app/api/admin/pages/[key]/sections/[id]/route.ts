import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";

const updateSectionSchema = z.object({
  blockType: z.string().min(1).optional(),
  sortOrder: z.number().int().min(0).optional(),
  content: z.string().optional(),
  settings: z.string().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ key: string; id: string }> },
) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { key, id } = await params;

  const page = await prisma.customPage.findUnique({ where: { slug: key } });
  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  const existing = await prisma.pageSection.findUnique({ where: { id } });
  if (!existing || existing.pageId !== page.id) {
    return NextResponse.json({ error: "Section not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = updateSectionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const section = await prisma.pageSection.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json(section);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ key: string; id: string }> },
) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { key, id } = await params;

  const page = await prisma.customPage.findUnique({ where: { slug: key } });
  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  const existing = await prisma.pageSection.findUnique({ where: { id } });
  if (!existing || existing.pageId !== page.id) {
    return NextResponse.json({ error: "Section not found" }, { status: 404 });
  }

  await prisma.pageSection.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
