import { NextResponse } from "next/server";

import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const user = await getUser();
    if (!user || !user.schoolId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const staff = await prisma.profile.findMany({
      where: {
        schoolId: user.schoolId,
        role: { in: ["teacher", "student"] },
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      staff: staff.map((s) => ({
        ...s,
        createdAt: s.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("School staff fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch staff" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user || !user.schoolId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { fullName, email, role } = body;

    if (!email || !email.trim()) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const existing = await prisma.profile.findFirst({
      where: { email: email.trim() },
    });

    if (existing) {
      if (existing.schoolId === user.schoolId) {
        return NextResponse.json({ error: "User already in this school" }, { status: 400 });
      }

      await prisma.profile.update({
        where: { id: existing.id },
        data: { schoolId: user.schoolId },
      });

      return NextResponse.json({ success: true, action: "linked", user: existing });
    }

    const newUser = await prisma.profile.create({
      data: {
        id: crypto.randomUUID(),
        email: email.trim(),
        fullName: fullName?.trim() || null,
        role: role ?? "teacher",
        schoolId: user.schoolId,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "create",
        resource: "Staff",
        resourceId: newUser.id,
        userId: user.id,
        details: JSON.stringify({ email: newUser.email, role: newUser.role }),
      },
    });

    return NextResponse.json({ success: true, action: "created", user: newUser });
  } catch (error) {
    console.error("School staff create error:", error);
    return NextResponse.json({ error: "Failed to add staff member" }, { status: 500 });
  }
}
