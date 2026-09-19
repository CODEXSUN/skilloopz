import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getUserId } from "@/lib/auth";
import { csrfGuard } from "@/lib/csrf";
import { getParentAlertConfig, DEFAULT_ALERT_CONFIG } from "@/lib/parent-alerts";

const alertConfigSchema = z.object({
  streakThreshold: z.number().int().min(1).max(14).optional(),
  inactivityDays: z.number().int().min(1).max(30).optional(),
  quizScoreThreshold: z.number().int().min(0).max(100).optional(),
  notifyStreakDrop: z.boolean().optional(),
  notifyInactivity: z.boolean().optional(),
  notifyLowScores: z.boolean().optional(),
  notifyCourseComplete: z.boolean().optional(),
});

export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.profile.findUnique({
    where: { id: userId },
    select: { role: true, metadata: true },
  });

  if (!profile || profile.role !== "parent") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const metadata = JSON.parse(profile.metadata ?? "{}") as Record<string, unknown>;
  const config = getParentAlertConfig(metadata);

  return NextResponse.json({ config });
}

export async function PATCH(request: Request) {
  const csrfError = csrfGuard(request);
  if (csrfError) return csrfError;

  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.profile.findUnique({
    where: { id: userId },
    select: { role: true, metadata: true },
  });

  if (!profile || profile.role !== "parent") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = alertConfigSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const metadata = JSON.parse(profile.metadata ?? "{}") as Record<string, unknown>;
  const currentConfig = getParentAlertConfig(metadata);

  const newConfig = {
    ...currentConfig,
    ...parsed.data,
  };

  const updatedMetadata = {
    ...metadata,
    alertConfig: newConfig,
  };

  await prisma.profile.update({
    where: { id: userId },
    data: { metadata: JSON.stringify(updatedMetadata) },
  });

  return NextResponse.json({ success: true, config: newConfig });
}
