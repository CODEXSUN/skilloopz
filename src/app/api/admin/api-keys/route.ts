import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";
import crypto from "crypto";

const createSchema = z.object({
  name: z.string().min(1).max(200),
  role: z.enum(["admin", "teacher", "student"]).optional().default("admin"),
});

function generateApiKey(): { key: string; prefix: string; lastChars: string } {
  const raw = crypto.randomBytes(32).toString("hex");
  const prefix = raw.slice(0, 8);
  const key = `neot_${raw}`;
  return { key, prefix, lastChars: raw.slice(-4) };
}

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const keys = await prisma.apiKey.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      prefix: true,
      lastChars: true,
      role: true,
      active: true,
      lastUsedAt: true,
      createdAt: true,
    },
  });

  return NextResponse.json(keys);
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

  const { key, prefix, lastChars } = generateApiKey();

  const apiKey = await prisma.apiKey.create({
    data: {
      name: parsed.data.name,
      key,
      prefix,
      lastChars,
      role: parsed.data.role,
    },
  });

  return NextResponse.json({
    id: apiKey.id,
    name: apiKey.name,
    prefix: apiKey.prefix,
    lastChars: apiKey.lastChars,
    role: apiKey.role,
    active: apiKey.active,
    createdAt: apiKey.createdAt,
    rawKey: key,
  }, { status: 201 });
}
