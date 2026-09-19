import { NextResponse } from "next/server";

import { getUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const passkeys = await prisma.passkey.findMany({
    where: { userId },
    select: {
      id: true,
      credentialId: true,
      deviceType: true,
      backedUp: true,
      transports: true,
      createdAt: true,
      lastUsedAt: true,
    },
    orderBy: { lastUsedAt: "desc" },
  });

  return NextResponse.json({ passkeys });
}
