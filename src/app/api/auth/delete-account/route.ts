import { NextResponse } from "next/server";
import { getUserId, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function DELETE(request: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { password, confirmDelete } = body;

  if (!confirmDelete) {
    return NextResponse.json(
      { error: "Confirmation is required" },
      { status: 400 },
    );
  }

  const profile = await prisma.profile.findUnique({
    where: { id: userId },
    select: { passwordHash: true, email: true },
  });

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  if (profile.passwordHash && password) {
    if (!verifyPassword(password, profile.passwordHash)) {
      return NextResponse.json(
        { error: "Password is incorrect" },
        { status: 400 },
      );
    }
  }

  await prisma.profile.delete({ where: { id: userId } });

  const response = NextResponse.json({ success: true });
  response.cookies.set("neot_session", "", { maxAge: 0, path: "/" });

  return response;
}
