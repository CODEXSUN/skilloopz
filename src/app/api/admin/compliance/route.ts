import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import { runComplianceReport, getComplianceReports } from "@/lib/security/compliance";

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const permError = await requirePermission(user.role, "settings", "read");
  if (permError) return permError;

  const data = await getComplianceReports();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const permError = await requirePermission(user.role, "settings", "update");
  if (permError) return permError;

  const body = await request.json().catch(() => ({}));
  const category = body.category ?? "all";

  const result = await runComplianceReport(category, user.id);
  return NextResponse.json(result, { status: 201 });
}
