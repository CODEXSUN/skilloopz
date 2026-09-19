import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit-log";

const updatePageSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/).optional(),
  path: z.string().min(1).max(200).startsWith("/").optional(),
  status: z.enum(["draft", "published"]).optional(),
  layout: z.enum(["default", "full_width", "landing"]).optional(),
  seo: z.string().optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { key } = await params;

  const page = await prisma.customPage.findUnique({
    where: { slug: key },
    include: {
      sections: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  return NextResponse.json(page);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { key } = await params;

  const existing = await prisma.customPage.findUnique({ where: { slug: key } });
  if (!existing) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = updatePageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  if (parsed.data.slug || parsed.data.path) {
    const conflict = await prisma.customPage.findFirst({
      where: {
        OR: [
          ...(parsed.data.slug ? [{ slug: parsed.data.slug }] : []),
          ...(parsed.data.path ? [{ path: parsed.data.path }] : []),
        ],
        NOT: { id: existing.id },
      },
    });
    if (conflict) {
      return NextResponse.json(
        { error: "Another page already uses this slug or path" },
        { status: 409 },
      );
    }
  }

  const page = await prisma.customPage.update({
    where: { id: existing.id },
    data: parsed.data,
  });

  return NextResponse.json(page);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { key } = await params;

  const existing = await prisma.customPage.findUnique({ where: { slug: key } });
  if (!existing) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  await prisma.customPage.delete({ where: { id: existing.id } });

  await createAuditLog({
    action: "delete",
    resource: "page",
    resourceId: existing.id,
    userId: user.id,
    details: { title: existing.title, slug: existing.slug },
  });

  return NextResponse.json({ success: true });
}
