import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";

export async function GET(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format");

  if (format === "json") {
    const [
      profiles,
      courses,
      modules,
      lessons,
      enrollments,
      categories,
      achievements,
      badges,
      settings,
      pages,
      sections,
      blockDefinitions,
      media,
      certificates,
      reports,
      notifications,
    ] = await Promise.all([
      prisma.profile.findMany(),
      prisma.course.findMany(),
      prisma.module.findMany(),
      prisma.lesson.findMany(),
      prisma.enrollment.findMany(),
      prisma.category.findMany(),
      prisma.achievement.findMany(),
      prisma.badge.findMany(),
      prisma.platformSetting.findMany(),
      prisma.customPage.findMany(),
      prisma.pageSection.findMany(),
      prisma.blockDefinition.findMany(),
      prisma.media.findMany(),
      prisma.certificate.findMany(),
      prisma.report.findMany(),
      prisma.notification.findMany(),
    ]);

    return NextResponse.json({
      success: true,
      exportedAt: new Date().toISOString(),
      data: {
        profiles,
        courses,
        modules,
        lessons,
        enrollments,
        categories,
        achievements,
        badges,
        settings,
        pages,
        sections,
        blockDefinitions,
        media,
        certificates,
        reports,
        notifications,
      },
    });
  }

  const dbUrl = process.env.DATABASE_URL ?? "file:prisma/dev.db";
  const dbPath = path.resolve(process.cwd(), dbUrl.replace("file:", ""));
  const stat = await fs.stat(dbPath);
  const fileBuffer = await fs.readFile(dbPath);

  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="neot-backup-${new Date().toISOString().split("T")[0]}.db"`,
      "Content-Length": String(stat.size),
    },
  });
}
