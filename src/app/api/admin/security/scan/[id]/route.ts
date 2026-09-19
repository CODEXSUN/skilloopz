import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import { getSecurityScan } from "@/lib/security/scanner";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const permError = await requirePermission(user.role, "settings", "read");
  if (permError) return permError;

  const { id } = await params;
  const scan = await getSecurityScan(id);
  if (!scan) return NextResponse.json({ error: "Scan not found" }, { status: 404 });

  return NextResponse.json(scan);
}
