import { NextResponse } from "next/server";

import { getUserId } from "@/lib/auth";
import { getRecommendations } from "@/lib/gamification/recommendation-engine";

export async function GET(request: Request) {
  const userId = await getUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") ?? "5", 10);

  const recommendations = await getRecommendations(userId, limit);

  return NextResponse.json({ recommendations });
}
