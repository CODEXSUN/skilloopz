import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { getUserInstallations } from "@/lib/marketplace-apps";

export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const installations = await getUserInstallations(userId);
  return NextResponse.json(installations);
}
