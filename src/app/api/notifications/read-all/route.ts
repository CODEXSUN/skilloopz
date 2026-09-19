import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { markAllNotificationsRead } from "@/lib/notifications";

export async function POST() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await markAllNotificationsRead(userId);
  return NextResponse.json({ success: true });
}
