import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getUserId } from "@/lib/auth";

const profileSchema = z.object({
  fullName: z.string().max(100).optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  ageGroup: z.enum(["child", "teen", "adult"]).optional(),
  grade: z.string().optional(),
  interests: z.array(z.string()).optional(),
  subjects: z.array(z.string()).optional(),
  gradeLevels: z.array(z.string()).optional(),
  bio: z.string().max(500).optional(),
  childName: z.string().max(100).optional(),
  childInterests: z.array(z.string()).optional(),
});

export async function PATCH(request: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { fullName, avatarUrl, ageGroup, interests, subjects, gradeLevels, bio, childName, childInterests } = parsed.data;

  try {
    const profile = await prisma.profile.findUnique({ where: { id: userId }, select: { metadata: true, role: true } });
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

    const newMetadata = { ...currentMetadata };

    if (interests !== undefined) newMetadata.interests = interests;
    if (subjects !== undefined) newMetadata.subjects = subjects;
    if (gradeLevels !== undefined) newMetadata.grade_levels = gradeLevels;
    if (bio !== undefined) newMetadata.bio = bio;
    if (childName !== undefined) newMetadata.child_name = childName;
    if (childInterests !== undefined) newMetadata.child_interests = childInterests;

    const updateData: Record<string, unknown> = {
      metadata: JSON.stringify(newMetadata),
    };

    if (fullName !== undefined) updateData.fullName = fullName || null;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl || null;
    if (ageGroup !== undefined) updateData.ageGroup = ageGroup;

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
