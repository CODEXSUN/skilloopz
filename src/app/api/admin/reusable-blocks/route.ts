import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";

const createSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  blockType: z.string().min(1),
  content: z.string().optional().default("{}"),
  settings: z.string().optional().default("{}"),
  category: z.string().optional().default("general"),
});

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const permError = await requirePermission(user.role, "templates", "read");
  if (permError) return permError;

  const blocks = await prisma.reusableBlock.findMany({
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(blocks);
}

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const permError = await requirePermission(user.role, "templates", "create");
  if (permError) return permError;

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const block = await prisma.reusableBlock.create({ data: parsed.data });
  return NextResponse.json(block, { status: 201 });
}
