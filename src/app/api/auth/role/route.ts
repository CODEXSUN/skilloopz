import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getUserId } from "@/lib/auth";

const roleSchema = z.object({
  role: z.enum(["student", "teacher", "parent"]),
  metadata: z
    .object({
      age_group: z.enum(["child", "teen", "adult"]).optional(),
      grade: z.string().optional(),
      interests: z.array(z.string()).optional(),
      subjects: z.array(z.string()).optional(),
      grade_levels: z.array(z.string()).optional(),
      bio: z.string().optional(),
      child_name: z.string().optional(),
      child_interests: z.array(z.string()).optional(),
    })
    .optional(),
});

export async function PATCH(request: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = roleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { role, metadata } = parsed.data;

  try {
    const updateData: Record<string, unknown> = {
      role,
      onboardingCompleted: true,
    };

    if (metadata?.age_group) {
      updateData.ageGroup = metadata.age_group;
    }

    if (metadata) {
      updateData.metadata = JSON.stringify(metadata);
    }

    await prisma.profile.update({
      where: { id: userId },
      data: updateData as never,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update profile" },
      { status: 500 },
    );
  }
}
