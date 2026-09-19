import { NextResponse } from "next/server";
import { z } from "zod";

import { getUserId } from "@/lib/auth";
import { getQuizAttempts } from "@/lib/quizzes";

const querySchema = z.object({
  lessonId: z.string().uuid(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ blockId: string }> },
) {
  const { blockId: _blockId } = await params;

  const userId = await getUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(_request.url);
  const lessonId = searchParams.get("lessonId");

  const parsed = querySchema.safeParse({ lessonId });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Missing lessonId query parameter" },
      { status: 400 },
    );
  }

  const attempts = await getQuizAttempts(userId, parsed.data.lessonId);
  const blockAttempts = attempts.filter(
    (a: { blockId: string }) => a.blockId === _blockId,
  );

  return NextResponse.json(blockAttempts);
}
