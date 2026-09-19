import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserId } from "@/lib/auth";
import { csrfGuard } from "@/lib/csrf";

export async function POST(request: Request) {
  const csrfError = csrfGuard(request);
  if (csrfError) return csrfError;

  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.profile.findUnique({
    where: { id: userId },
    select: { email: true, emailVerified: true, verificationToken: true },
  });

  if (!profile?.email) {
    return NextResponse.json({ error: "No email on account" }, { status: 400 });
  }

  if (profile.emailVerified) {
    return NextResponse.json({ error: "Email already verified" }, { status: 400 });
  }

  const token = crypto.randomUUID();

  await prisma.profile.update({
    where: { id: userId },
    data: { verificationToken: token },
  });

  const verificationUrl = `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/api/auth/verify-email?token=${token}`;

  return NextResponse.json({
    success: true,
    message: "Verification email sent",
    verificationUrl,
  });
}
