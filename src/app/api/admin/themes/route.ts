import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit-log";

const createThemeSchema = z.object({
  name: z.string().min(1).max(100),
  isActive: z.boolean().optional().default(false),
  tokens: z.string().optional().default("{}"),
});

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const themes = await prisma.siteTheme.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(themes);
}

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const parsed = createThemeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  if (parsed.data.isActive) {
    await prisma.siteTheme.updateMany({ data: { isActive: false } });
  }

  const theme = await prisma.siteTheme.create({ data: parsed.data });

  await createAuditLog({
    action: "theme_change",
    resource: "theme",
    resourceId: theme.id,
    userId: user.id,
    details: { name: theme.name, isActive: theme.isActive },
  });

  return NextResponse.json(theme, { status: 201 });
}
