import { NextResponse } from "next/server";

import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function DELETE(_request: Request, { params }: PageProps) {
  try {
    const { id } = await params;
    const user = await getUser();

    if (!user || !user.schoolId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const staff = await prisma.profile.findUnique({
      where: { id },
      select: { schoolId: true, email: true },
    });

    if (!staff || staff.schoolId !== user.schoolId) {
      return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
    }

    await prisma.profile.update({
      where: { id },
      data: { schoolId: null },
    });

    await prisma.auditLog.create({
      data: {
        action: "remove",
        resource: "Staff",
        resourceId: id,
        userId: user.id,
        details: JSON.stringify({ email: staff.email }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Staff remove error:", error);
    return NextResponse.json({ error: "Failed to remove staff member" }, { status: 500 });
  }
}
