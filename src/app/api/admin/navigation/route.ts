import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { getNavItems } from "@/lib/navigation-service";

const navItemSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1, "Label is required"),
  href: z.string().min(1, "Href is required"),
  icon: z.string().optional().nullable(),
  role: z.string().optional().default("all"),
  parentId: z.string().optional().nullable(),
  sortOrder: z.coerce.number().int().optional().default(0),
  isVisible: z.coerce.boolean().optional().default(true),
});

export async function GET(request: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role") ?? user.role;

  const items = await getNavItems(role);
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const parsed = navItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { id, ...data } = parsed.data;

  if (id) {
    const existing = await prisma.navItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Nav item not found" }, { status: 404 });
    }
    const updated = await prisma.navItem.update({ where: { id }, data });
    return NextResponse.json(updated);
  }

  const created = await prisma.navItem.create({ data });
  return NextResponse.json(created, { status: 201 });
}

export async function DELETE(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id query parameter required" }, { status: 400 });
  }

  const existing = await prisma.navItem.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Nav item not found" }, { status: 404 });
  }

  await prisma.navItem.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
