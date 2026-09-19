import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import { runSecurityScan, getSecurityScans } from "@/lib/security/scanner";

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const permError = await requirePermission(user.role, "settings", "read");
  if (permError) return permError;

  const data = await getSecurityScans();
  return NextResponse.json(data);
}

export async function POST() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const permError = await requirePermission(user.role, "settings", "update");
  if (permError) return permError;

  const result = await runSecurityScan(user.id);
  return NextResponse.json(result, { status: 201 });
}
