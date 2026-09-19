import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { getUserNotifications, getUnreadCount } from "@/lib/notifications";

export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [notifications, unreadCount] = await Promise.all([
    getUserNotifications(userId),
    getUnreadCount(userId),
  ]);

  return NextResponse.json({ notifications, unreadCount });
}
