import { NextResponse } from "next/server";
import { z } from "zod";
import { getUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";

const updateProgressSchema = z.object({
  islandId: z.string(),
  status: z.enum(["locked", "unlocked", "in_progress", "completed"]),
  progress: z.number().min(0).max(1).optional(),
});

export async function POST(request: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = updateProgressSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { islandId, status, progress } = parsed.data;

  const result = await prisma.worldProgress.upsert({
    where: { userId_islandId: { userId, islandId } },
    update: {
      status,
      ...(progress !== undefined ? { progress } : {}),
      ...(status === "completed" ? { completedAt: new Date() } : {}),
    },
    create: {
      userId,
      islandId,
      status,
      progress: progress ?? 0,
      startedAt: status === "in_progress" ? new Date() : undefined,
    },
  });

  return NextResponse.json(result, { status: 201 });
}