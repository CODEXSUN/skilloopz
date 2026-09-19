import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const role = request.nextUrl.searchParams.get("role");

  if (role) {
    const config = await prisma.dashboardConfig.findUnique({ where: { role } });
    return NextResponse.json(config ?? { role, widgets: "[]" });
  }

  const configs = await prisma.dashboardConfig.findMany();
  return NextResponse.json(configs);
}

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { role, widgets } = body;

  if (!role || !Array.isArray(widgets)) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const config = await prisma.dashboardConfig.upsert({
    where: { role },
    create: { role, widgets: JSON.stringify(widgets) },
    update: { widgets: JSON.stringify(widgets) },
  });

  return NextResponse.json(config);
}
