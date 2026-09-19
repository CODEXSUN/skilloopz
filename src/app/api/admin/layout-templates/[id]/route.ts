import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";

const updateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/).optional(),
  slots: z.array(z.string().min(1).max(100)).min(1).optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  const existing = await prisma.layoutTemplate.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Layout not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) data.name = parsed.data.name;
  if (parsed.data.description !== undefined) data.description = parsed.data.description;
  if (parsed.data.slug !== undefined) {
    const slugExists = await prisma.layoutTemplate.findFirst({
      where: { slug: parsed.data.slug, id: { not: id } },
    });
    if (slugExists) {
      return NextResponse.json({ error: "Slug already in use" }, { status: 409 });
    }
    data.slug = parsed.data.slug;
  }
  if (parsed.data.slots !== undefined) data.slots = JSON.stringify(parsed.data.slots);

  const layout = await prisma.layoutTemplate.update({ where: { id }, data });
  return NextResponse.json({ ...layout, slots: JSON.parse(layout.slots) });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  const pageUsing = await prisma.customPage.count({ where: { layoutTemplateId: id } });
  if (pageUsing > 0) {
    return NextResponse.json(
      { error: `Cannot delete: ${pageUsing} page(s) use this layout. Remove the layout assignment first.` },
      { status: 409 },
    );
  }

  const existing = await prisma.layoutTemplate.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Layout not found" }, { status: 404 });
  }

  await prisma.layoutTemplate.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
