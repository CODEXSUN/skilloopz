import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { getUnreadCount } from "@/lib/notifications";

export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const count = await getUnreadCount(userId);
  return NextResponse.json({ count });
}
