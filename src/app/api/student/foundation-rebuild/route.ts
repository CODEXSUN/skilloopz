import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { getFoundationRebuildSuggestions } from "@/lib/learning/foundation-rebuilder";

export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await getFoundationRebuildSuggestions(userId);
  return NextResponse.json(result);
}
