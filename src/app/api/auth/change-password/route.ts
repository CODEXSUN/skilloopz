import { NextResponse } from "next/server";
import { z } from "zod";
import { getUserId, getUser, verifyPassword, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export async function POST(request: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = passwordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const profile = await prisma.profile.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });

  if (!profile || !profile.passwordHash) {
    return NextResponse.json(
      { error: "Cannot change password — account uses external auth" },
      { status: 400 },
    );
  }

  if (!verifyPassword(parsed.data.currentPassword, profile.passwordHash)) {
    return NextResponse.json(
      { error: "Current password is incorrect" },
      { status: 400 },
    );
  }

  const newPasswordHash = hashPassword(parsed.data.newPassword);

  await prisma.profile.update({
    where: { id: userId },
    data: { passwordHash: newPasswordHash },
  });

  return NextResponse.json({ success: true });
}
