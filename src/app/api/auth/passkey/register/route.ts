import { NextResponse } from "next/server";
import { z } from "zod";

import { getUserId, getUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

const registerSchema = z.object({
  credential: z.object({
    id: z.string(),
    rawId: z.string(),
    response: z.object({
      clientDataJSON: z.string(),
      attestationObject: z.string(),
      transports: z.array(z.string()).optional(),
    }),
    type: z.literal("public-key"),
  }),
  deviceType: z.string().default("single-device"),
});

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid credential data" }, { status: 400 });
  }

  const { credential, deviceType } = parsed.data;

  const existing = await prisma.passkey.findUnique({
    where: { credentialId: credential.id },
  });

  if (existing) {
    return NextResponse.json({ error: "Credential already registered" }, { status: 400 });
  }

  await prisma.passkey.create({
    data: {
      userId: user.id,
      credentialId: credential.id,
      credentialPublicKey: credential.response.attestationObject,
      deviceType,
      transports: JSON.stringify(credential.response.transports ?? []),
    },
  });

  return NextResponse.json({ success: true });
}
