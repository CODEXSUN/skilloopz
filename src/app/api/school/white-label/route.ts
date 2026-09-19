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
    const {
      logoUrl,
      faviconUrl,
      primaryColor,
      secondaryColor,
      backgroundColor,
      textColor,
      fontFamily,
      customCss,
      welcomeMessage,
      footerText,
      hideBranding,
      customDomain,
    } = body;

    const existing = await prisma.schoolWhiteLabel.findUnique({
      where: { schoolId: user.schoolId },
    });

    let updated;

    if (existing) {
      updated = await prisma.schoolWhiteLabel.update({
        where: { schoolId: user.schoolId },
        data: {
          logoUrl: logoUrl?.trim() || null,
          faviconUrl: faviconUrl?.trim() || null,
          primaryColor: primaryColor ?? "#3b82f6",
          secondaryColor: secondaryColor ?? "#8b5cf6",
          backgroundColor: backgroundColor ?? "#ffffff",
          textColor: textColor ?? "#111827",
          fontFamily: fontFamily?.trim() || null,
          customCss: customCss || null,
          welcomeMessage: welcomeMessage?.trim() || null,
          footerText: footerText?.trim() || null,
          hideBranding: hideBranding ?? false,
          customDomain: customDomain?.trim() || null,
        },
      });
    } else {
      updated = await prisma.schoolWhiteLabel.create({
        data: {
          schoolId: user.schoolId,
          logoUrl: logoUrl?.trim() || null,
          faviconUrl: faviconUrl?.trim() || null,
          primaryColor: primaryColor ?? "#3b82f6",
          secondaryColor: secondaryColor ?? "#8b5cf6",
          backgroundColor: backgroundColor ?? "#ffffff",
          textColor: textColor ?? "#111827",
          fontFamily: fontFamily?.trim() || null,
          customCss: customCss || null,
          welcomeMessage: welcomeMessage?.trim() || null,
          footerText: footerText?.trim() || null,
          hideBranding: hideBranding ?? false,
          customDomain: customDomain?.trim() || null,
        },
      });
    }

    await prisma.auditLog.create({
      data: {
        action: "update",
        resource: "SchoolWhiteLabel",
        resourceId: updated.id,
        userId: user.id,
        details: JSON.stringify({ schoolId: user.schoolId }),
      },
    });

    return NextResponse.json({ success: true, whiteLabel: updated });
  } catch (error) {
    console.error("White-label update error:", error);
    return NextResponse.json({ error: "Failed to update white-label settings" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await getUser();
    if (!user || !user.schoolId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const whiteLabel = await prisma.schoolWhiteLabel.findUnique({
      where: { schoolId: user.schoolId },
    });

    return NextResponse.json({ whiteLabel });
  } catch (error) {
    console.error("White-label fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch white-label settings" }, { status: 500 });
  }
}
