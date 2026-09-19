import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";

export async function POST() {
  const passkeys = await prisma.passkey.findMany({
    select: { credentialId: true },
  });

  if (passkeys.length === 0) {
    return NextResponse.json({ error: "No passkeys registered" }, { status: 404 });
  }

  const challenge = crypto.getRandomValues(new Uint8Array(32));

  return NextResponse.json({
    challenge: bufferToBase64url(challenge),
    timeout: 60000,
    userVerification: "preferred",
    allowCredentials: passkeys.map((pk) => ({
      id: pk.credentialId,
      type: "public-key" as const,
    })),
  });
}

function bufferToBase64url(buffer: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < buffer.length; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
