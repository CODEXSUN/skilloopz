import { NextResponse } from "next/server";

import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(request: Request) {
  try {
    const user = await getUser();
    if (!user || !user.schoolId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, phone, address, city, state, country, postalCode, website } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "School name is required" }, { status: 400 });
    }

    const updated = await prisma.school.update({
      where: { id: user.schoolId },
      data: {
        name: name.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        address: address?.trim() || null,
        city: city?.trim() || null,
        state: state?.trim() || null,
        country: country?.trim() || "US",
        postalCode: postalCode?.trim() || null,
        website: website?.trim() || null,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "update",
        resource: "School",
        resourceId: updated.id,
        userId: user.id,
        details: JSON.stringify({ name: updated.name }),
      },
    });

    return NextResponse.json({ success: true, school: updated });
  } catch (error) {
    console.error("School settings update error:", error);
    return NextResponse.json({ error: "Failed to update school settings" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await getUser();
    if (!user || !user.schoolId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const school = await prisma.school.findUnique({
      where: { id: user.schoolId },
      include: {
        whiteLabel: true,
      },
    });

    if (!school) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    return NextResponse.json({ school });
  } catch (error) {
    console.error("School settings fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch school settings" }, { status: 500 });
  }
}
