import { NextResponse } from "next/server";

import { getUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function DELETE(request: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json({ error: "Passkey ID required" }, { status: 400 });
  }

  const passkey = await prisma.passkey.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!passkey || passkey.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.passkey.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
