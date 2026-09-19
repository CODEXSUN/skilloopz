import { NextResponse } from "next/server";

import { getUserId } from "@/lib/auth";
import { getStreakNotifications, getStreakHistory } from "@/lib/gamification/streak-notifications";

export async function GET(request: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const includeHistory = searchParams.get("history") === "true";
  const historyDays = parseInt(searchParams.get("days") ?? "30", 10);

  const notifications = await getStreakNotifications(userId);

  let history: { date: string; active: boolean }[] = [];
  if (includeHistory) {
    history = await getStreakHistory(userId, Math.min(historyDays, 90));
  }

  return NextResponse.json({
    notifications,
    history: includeHistory ? history : undefined,
  });
}
