import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const pageId = searchParams.get("pageId");

  if (!token || !pageId) {
    return NextResponse.json({ error: "Missing token or pageId" }, { status: 400 });
  }

  const record = await prisma.previewToken.findUnique({ where: { token } });
  if (!record || record.expiresAt < new Date()) {
    return NextResponse.json({ error: "Invalid or expired preview token" }, { status: 401 });
  }

  const page = await prisma.customPage.findUnique({ where: { id: pageId } });
  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  const cookieStore = await cookies();
  cookieStore.set("preview_mode", "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60,
  });

  await prisma.previewToken.delete({ where: { id: record.id } });

  return NextResponse.redirect(new URL(page.path, request.url));
}
