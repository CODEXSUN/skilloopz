import { NextResponse } from "next/server";

import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user || !user.schoolId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { entries, role } = body;

    if (!Array.isArray(entries) || entries.length === 0) {
      return NextResponse.json({ error: "Entries array is required" }, { status: 400 });
    }

    let imported = 0;
    let skipped = 0;

    for (const entry of entries) {
      const email = entry.email?.trim();
      if (!email) {
        skipped++;
        continue;
      }

      const existing = await prisma.profile.findFirst({
        where: { email },
      });

      if (existing) {
        if (existing.schoolId === user.schoolId) {
          skipped++;
          continue;
        }

        await prisma.profile.update({
          where: { id: existing.id },
          data: {
            schoolId: user.schoolId,
            fullName: entry.fullName?.trim() || existing.fullName,
          },
        });
        imported++;
      } else {
        await prisma.profile.create({
          data: {
            id: crypto.randomUUID(),
            email,
            fullName: entry.fullName?.trim() || null,
            role: role ?? "teacher",
            schoolId: user.schoolId,
          },
        });
        imported++;
      }
    }

    await prisma.auditLog.create({
      data: {
        action: "bulk_import",
        resource: "Staff",
        userId: user.id,
        details: JSON.stringify({ imported, skipped, total: entries.length }),
      },
    });

    return NextResponse.json({ success: true, imported, skipped });
  } catch (error) {
    console.error("Bulk staff import error:", error);
    return NextResponse.json({ error: "Failed to import staff" }, { status: 500 });
  }
}
