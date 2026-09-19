import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";

const applySchema = z.object({
  pageId: z.string().min(1, "Page ID is required"),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  const template = await prisma.pageTemplate.findUnique({ where: { id } });
  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = applySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { pageId } = parsed.data;

  const page = await prisma.customPage.findUnique({ where: { id: pageId } });
  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  let sectionData: { blockType: string; sortOrder: number; content: string; settings: string }[];
  try {
    sectionData = JSON.parse(template.sections);
    if (!Array.isArray(sectionData)) throw new Error("Sections must be an array");
  } catch {
    return NextResponse.json({ error: "Invalid template sections data" }, { status: 400 });
  }

  await prisma.pageSection.deleteMany({ where: { pageId } });

  if (sectionData.length > 0) {
    await prisma.pageSection.createMany({
      data: sectionData.map((s, i) => ({
        pageId,
        blockType: s.blockType,
        sortOrder: s.sortOrder ?? i,
        content: s.content ?? "{}",
        settings: s.settings ?? "{}",
      })),
    });
  }

  const sections = await prisma.pageSection.findMany({
    where: { pageId },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json({ page, sections });
}
