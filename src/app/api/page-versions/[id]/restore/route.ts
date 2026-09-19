import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { restoreSnapshot } from "@/lib/version-service";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  try {
    const result = await restoreSnapshot(id);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to restore snapshot" },
      { status: 404 },
    );
  }
}
