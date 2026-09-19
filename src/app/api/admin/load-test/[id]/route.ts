import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import { getLoadTestRun } from "@/lib/security/load-test";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const permError = await requirePermission(user.role, "settings", "read");
  if (permError) return permError;

  const { id } = await params;
  const run = await getLoadTestRun(id);
  if (!run) return NextResponse.json({ error: "Load test not found" }, { status: 404 });

  return NextResponse.json(run);
}
