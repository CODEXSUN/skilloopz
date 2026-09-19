import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";

const createSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional().default(""),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/),
  slots: z.array(z.string().min(1).max(100)).min(1).default(["main"]),
});

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const layouts = await prisma.layoutTemplate.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { pages: true } } },
  });

  return NextResponse.json(
    layouts.map((l) => ({ ...l, slots: JSON.parse(l.slots), pageCount: l._count.pages, _count: undefined })),
  );
}

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const existing = await prisma.layoutTemplate.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) {
    return NextResponse.json({ error: "A layout with this slug already exists" }, { status: 409 });
  }

  const layout = await prisma.layoutTemplate.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      slug: parsed.data.slug,
      slots: JSON.stringify(parsed.data.slots),
    },
  });

  return NextResponse.json({ ...layout, slots: JSON.parse(layout.slots) }, { status: 201 });
}
