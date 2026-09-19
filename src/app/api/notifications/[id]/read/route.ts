import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { markNotificationRead } from "@/lib/notifications";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await markNotificationRead(id, userId);
  return NextResponse.json({ success: true });
}
