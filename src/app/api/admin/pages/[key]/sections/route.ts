import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";

const createSectionSchema = z.object({
  blockType: z.string().min(1),
  sortOrder: z.number().int().min(0).optional(),
  content: z.string().optional().default("{}"),
  settings: z.string().optional().default("{}"),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { key } = await params;

  const page = await prisma.customPage.findUnique({ where: { slug: key } });
  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  const sections = await prisma.pageSection.findMany({
    where: { pageId: page.id },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json(sections);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { key } = await params;

  const page = await prisma.customPage.findUnique({ where: { slug: key } });
  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = createSectionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  let sortOrder = parsed.data.sortOrder;
  if (sortOrder === undefined) {
    const lastSection = await prisma.pageSection.findFirst({
      where: { pageId: page.id },
      orderBy: { sortOrder: "desc" },
    });
    sortOrder = (lastSection?.sortOrder ?? -1) + 1;
  }

  const section = await prisma.pageSection.create({
    data: {
      pageId: page.id,
      blockType: parsed.data.blockType,
      sortOrder,
      content: parsed.data.content,
      settings: parsed.data.settings,
    },
  });

  return NextResponse.json(section, { status: 201 });
}
