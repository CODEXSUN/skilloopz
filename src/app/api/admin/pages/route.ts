import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import { createAuditLog } from "@/lib/audit-log";

const createPageSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  path: z.string().min(1).max(200).startsWith("/", "Path must start with /"),
  status: z.enum(["draft", "published"]).optional().default("draft"),
  layout: z.enum(["default", "full_width", "landing"]).optional().default("default"),
  seo: z.string().optional().default("{}"),
});

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const permError = await requirePermission(user.role, "pages", "read");
  if (permError) return permError;

  const pages = await prisma.customPage.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { sections: true } } },
  });

  return NextResponse.json(pages);
}

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const permError = await requirePermission(user.role, "pages", "create");
  if (permError) return permError;

  const body = await request.json();
  const parsed = createPageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const existing = await prisma.customPage.findFirst({
    where: { OR: [{ slug: parsed.data.slug }, { path: parsed.data.path }] },
  });
  if (existing) {
    return NextResponse.json(
      { error: existing.slug === parsed.data.slug ? "A page with this slug already exists" : "A page with this path already exists" },
      { status: 409 },
    );
  }

  const page = await prisma.customPage.create({ data: parsed.data });

  await createAuditLog({
    action: "create",
    resource: "page",
    resourceId: page.id,
    userId: user.id,
    details: { title: page.title, slug: page.slug },
  });

  return NextResponse.json(page, { status: 201 });
}
