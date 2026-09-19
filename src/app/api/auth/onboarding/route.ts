import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getUserId } from "@/lib/auth";

const onboardingSchema = z.object({
  fullName: z.string().max(100).optional(),
  ageGroup: z.enum(["child", "teen", "adult"]).optional(),
  interests: z.array(z.string()).optional(),
  experienceLevel: z.string().optional(),
  goals: z.string().optional(),
  subjects: z.array(z.string()).optional(),
  gradeLevels: z.array(z.string()).optional(),
  yearsExperience: z.string().optional(),
  bio: z.string().max(500).optional(),
  childName: z.string().max(100).optional(),
  childAgeGroup: z.enum(["child", "teen", "adult"]).optional(),
  childInterests: z.array(z.string()).optional(),
});

export async function PATCH(request: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = onboardingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const profile = await prisma.profile.findUnique({
      where: { id: userId },
      select: { metadata: true },
    });
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const currentMetadata = (() => {
      try {
        return typeof profile.metadata === "string"
          ? JSON.parse(profile.metadata)
          : {};
      } catch {
        return {};
      }
    })();

    const data = parsed.data;
    const mergedMetadata = { ...currentMetadata };

    if (data.fullName !== undefined) mergedMetadata.fullName = data.fullName;
    if (data.ageGroup !== undefined) mergedMetadata.ageGroup = data.ageGroup;
    if (data.interests !== undefined) mergedMetadata.interests = data.interests;
    if (data.experienceLevel !== undefined) mergedMetadata.experienceLevel = data.experienceLevel;
    if (data.goals !== undefined) mergedMetadata.goals = data.goals;
    if (data.subjects !== undefined) mergedMetadata.subjects = data.subjects;
    if (data.gradeLevels !== undefined) mergedMetadata.grade_levels = data.gradeLevels;
    if (data.yearsExperience !== undefined) mergedMetadata.yearsExperience = data.yearsExperience;
    if (data.bio !== undefined) mergedMetadata.bio = data.bio;
    if (data.childName !== undefined) mergedMetadata.child_name = data.childName;
    if (data.childAgeGroup !== undefined) mergedMetadata.childAgeGroup = data.childAgeGroup;
    if (data.childInterests !== undefined) mergedMetadata.child_interests = data.childInterests;

    const updateData: Record<string, unknown> = {
      onboardingCompleted: true,
      metadata: JSON.stringify(mergedMetadata),
    };

    if (data.fullName !== undefined) {
      updateData.fullName = data.fullName || null;
    }

    await prisma.profile.update({
      where: { id: userId },
      data: updateData as never,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to complete onboarding" },
      { status: 500 },
    );
  }
}
