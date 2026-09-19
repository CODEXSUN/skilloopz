import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import { getComplianceReport } from "@/lib/security/compliance";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const permError = await requirePermission(user.role, "settings", "read");
  if (permError) return permError;

  const { id } = await params;
  const report = await getComplianceReport(id);
  if (!report) return NextResponse.json({ error: "Report not found" }, { status: 404 });

  return NextResponse.json(report);
}
