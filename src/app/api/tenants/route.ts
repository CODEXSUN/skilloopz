import { NextResponse } from "next/server";

import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const user = await getUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenants = await prisma.tenant.findMany({
    include: {
      _count: {
        select: {
          users: true,
          courses: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    tenants: tenants.map((t) => ({
      ...t,
      userCount: t._count.users,
      courseCount: t._count.courses,
    })),
  });
}

export async function POST(request: Request) {
  const user = await getUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, slug, plan, maxUsers } = body;

  if (!name || !slug) {
    return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });
  }

  const existing = await prisma.tenant.findUnique({
    where: { slug: slug.toLowerCase() },
  });

  if (existing) {
    return NextResponse.json({ error: "Slug already taken" }, { status: 400 });
  }

  const tenant = await prisma.tenant.create({
    data: {
      name: name.trim(),
      slug: slug.toLowerCase().trim(),
      plan: plan ?? "free",
      maxUsers: maxUsers ?? 10,
    },
  });

  return NextResponse.json({ success: true, tenant }, { status: 201 });
}
