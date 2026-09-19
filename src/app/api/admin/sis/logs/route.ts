import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { getSisSyncLogs } from "@/lib/sis";

export async function GET(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const configId = searchParams.get("configId") || undefined;
  const limit = parseInt(searchParams.get("limit") || "20", 10);

  const logs = await getSisSyncLogs(configId, limit);
  return NextResponse.json(logs);
}
