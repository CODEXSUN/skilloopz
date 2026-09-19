import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";

export async function POST(
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

  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.previewToken.create({
    data: {
      pageId: page.id,
      token,
      expiresAt,
    },
  });

  const previewUrl = `/api/preview?token=${token}&pageId=${page.id}`;

  return NextResponse.json({ url: previewUrl, token });
}
