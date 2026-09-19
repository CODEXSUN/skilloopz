import { NextResponse } from "next/server";

import { createSession, getSessionCookieName } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const body = await request.json();
  const { credentialId } = body;

  if (!credentialId) {
    return NextResponse.json({ error: "Credential ID required" }, { status: 400 });
  }

  const passkey = await prisma.passkey.findUnique({
    where: { credentialId },
  });

  if (!passkey) {
    return NextResponse.json({ error: "Credential not found" }, { status: 404 });
  }

  const user = await prisma.profile.findUnique({ where: { id: passkey.userId } });

  if (!user || user.status !== "active") {
    return NextResponse.json({ error: "Account is not active" }, { status: 403 });
  }

  await prisma.passkey.update({
    where: { id: passkey.id },
    data: { lastUsedAt: new Date() },
  });

  const token = await createSession(passkey.userId);

  const response = NextResponse.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    },
  });

  response.cookies.set(getSessionCookieName(), token, {
    httpOnly: true,
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
    sameSite: "lax",
  });

  return response;
}
