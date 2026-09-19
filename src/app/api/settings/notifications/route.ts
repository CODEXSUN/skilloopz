import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.profile.findUnique({
    where: { id: userId },
    select: { metadata: true },
  });

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const metadata = (() => {
    try {
      return JSON.parse(profile.metadata ?? "{}");
    } catch {
      return {};
    }
  })();

  const defaults = {
    notifyXp: true,
    notifyAchievements: true,
    notifyStreaks: true,
    notifyCourseUpdates: true,
    notifyMessages: true,
    notifyGrading: true,
  };

  const preferences = {
    notifyXp: metadata.notifyXp ?? defaults.notifyXp,
    notifyAchievements: metadata.notifyAchievements ?? defaults.notifyAchievements,
    notifyStreaks: metadata.notifyStreaks ?? defaults.notifyStreaks,
    notifyCourseUpdates: metadata.notifyCourseUpdates ?? defaults.notifyCourseUpdates,
    notifyMessages: metadata.notifyMessages ?? defaults.notifyMessages,
    notifyGrading: metadata.notifyGrading ?? defaults.notifyGrading,
  };

  return NextResponse.json({ preferences });
}

export async function PATCH(request: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { preferences } = body;

  if (!preferences || typeof preferences !== "object") {
    return NextResponse.json(
      { error: "Preferences object is required" },
      { status: 400 },
    );
  }

  const profile = await prisma.profile.findUnique({
    where: { id: userId },
    select: { metadata: true },
  });

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const currentMetadata = (() => {
    try {
      return typeof profile.metadata === "string" ? JSON.parse(profile.metadata) : {};
    } catch {
      return {};
    }
  })();

  const updatedMetadata = { ...currentMetadata, ...preferences };

  await prisma.profile.update({
    where: { id: userId },
    data: { metadata: JSON.stringify(updatedMetadata) },
  });

  return NextResponse.json({ success: true });
}
