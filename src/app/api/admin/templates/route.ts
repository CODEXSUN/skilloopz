import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";

const createTemplateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().nullable(),
  category: z.enum(["page", "dashboard", "marketing"]).optional().default("page"),
  sections: z.string().default("[]"),
});

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const templates = await prisma.pageTemplate.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(templates);
}

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const parsed = createTemplateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { name, description, category, sections } = parsed.data;
  const slug = generateSlug(name);

  const existing = await prisma.pageTemplate.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: "A template with this slug already exists" }, { status: 409 });
  }

  const template = await prisma.pageTemplate.create({
    data: { name, slug, description, category, sections },
  });

  return NextResponse.json(template, { status: 201 });
}
