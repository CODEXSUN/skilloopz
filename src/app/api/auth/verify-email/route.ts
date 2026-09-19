import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/login?error=missing_token", request.url));
  }

  const profile = await prisma.profile.findFirst({
    where: { verificationToken: token },
  });

  if (!profile) {
    return NextResponse.redirect(new URL("/login?error=invalid_token", request.url));
  }

  if (profile.emailVerified) {
    return NextResponse.redirect(new URL("/login?error=already_verified", request.url));
  }

  await prisma.profile.update({
    where: { id: profile.id },
    data: {
      emailVerified: new Date(),
      verificationToken: null,
    },
  });

  return NextResponse.redirect(new URL("/login?verified=true", request.url));
}
