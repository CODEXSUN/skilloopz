import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { randomBytes } from "crypto";
import { sendPasswordResetEmail } from "@/lib/email";

const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = body.email?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const profile = await prisma.profile.findFirst({
      where: { email, status: "active" },
    });

    if (!profile || !profile.passwordHash) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await prisma.passwordResetToken.updateMany({
      where: { userId: profile.id, used: false },
      data: { used: true },
    });

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS);

    await prisma.passwordResetToken.create({
      data: {
        userId: profile.id,
        token,
        expiresAt,
      },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/reset-password?token=${token}`;

    sendPasswordResetEmail(email, token);

    return NextResponse.json({
      success: true,
      message: "If an account exists with that email, a reset link has been generated.",
      resetUrl,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to process password reset request" },
      { status: 500 },
    );
  }
}
