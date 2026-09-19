import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { createVersionSnapshot, getVersionSnapshots } from "@/lib/version-service";
import { createAuditLog } from "@/lib/audit-log";

export async function GET(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const pageId = searchParams.get("pageId");

  if (!pageId) {
    return NextResponse.json({ error: "pageId is required" }, { status: 400 });
  }

  const snapshots = await getVersionSnapshots(pageId);
  return NextResponse.json(snapshots);
}

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { pageId, versionTag } = body;

  if (!pageId) {
    return NextResponse.json({ error: "pageId is required" }, { status: 400 });
  }

  const page = await prisma.customPage.findUnique({ where: { id: pageId } });
  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  const snapshot = await createVersionSnapshot(pageId, versionTag);

  if (versionTag === "publish") {
    await createAuditLog({
      action: "publish",
      resource: "page",
      resourceId: pageId,
      userId: user.id,
      details: { title: page.title, slug: page.slug },
    });
  }

  return NextResponse.json(snapshot, { status: 201 });
}
