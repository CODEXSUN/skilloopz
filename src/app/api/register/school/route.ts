import { NextResponse } from "next/server";

import { hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, code, adminName, adminEmail, adminPassword, phone, website, city, country } = body;

    if (!name || !code || !adminName || !adminEmail || !adminPassword) {
      return NextResponse.json({ error: "All required fields must be provided" }, { status: 400 });
    }

    if (adminPassword.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const existingSchool = await prisma.school.findFirst({
      where: {
        OR: [
          { code: code.toLowerCase() },
          { name: name.trim() },
        ],
      },
    });

    if (existingSchool) {
      if (existingSchool.code === code.toLowerCase()) {
        return NextResponse.json({ error: "School code already taken" }, { status: 400 });
      }
      return NextResponse.json({ error: "School name already exists" }, { status: 400 });
    }

    const existingAdmin = await prisma.profile.findFirst({
      where: { email: adminEmail.trim().toLowerCase() },
    });

    if (existingAdmin) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const passwordHash = hashPassword(adminPassword);

    const school = await prisma.school.create({
      data: {
        name: name.trim(),
        code: code.toLowerCase().trim(),
        phone: phone?.trim() || null,
        website: website?.trim() || null,
        city: city?.trim() || null,
        country: country?.trim() || "US",
      },
    });

    const admin = await prisma.profile.create({
      data: {
        id: crypto.randomUUID(),
        email: adminEmail.trim().toLowerCase(),
        fullName: adminName.trim(),
        role: "school_admin",
        passwordHash,
        schoolId: school.id,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "create",
        resource: "School",
        resourceId: school.id,
        userId: admin.id,
        details: JSON.stringify({ name: school.name, code: school.code }),
      },
    });

    return NextResponse.json({
      success: true,
      school: { id: school.id, name: school.name, code: school.code },
    });
  } catch (error) {
    console.error("School registration error:", error);
    return NextResponse.json({ error: "Failed to register school" }, { status: 500 });
  }
}
