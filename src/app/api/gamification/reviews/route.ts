import { NextResponse } from "next/server";

import { getUserId } from "@/lib/auth";
import { getSpacedRepetitionReviews, getReviewSummary } from "@/lib/gamification/spaced-repetition";

export async function GET(request: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") ?? "list";
  const limit = parseInt(searchParams.get("limit") ?? "10", 10);

  if (type === "summary") {
    const summary = await getReviewSummary(userId);
    return NextResponse.json(summary);
  }

  const reviews = await getSpacedRepetitionReviews(userId, limit);
  return NextResponse.json({ reviews });
}
