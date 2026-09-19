import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import { runLoadTest, getLoadTestRuns } from "@/lib/security/load-test";

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const permError = await requirePermission(user.role, "settings", "read");
  if (permError) return permError;

  const data = await getLoadTestRuns();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const permError = await requirePermission(user.role, "settings", "update");
  if (permError) return permError;

  const body = await request.json();
  const { targetUrl, method, concurrency, totalRequests } = body;

  if (!targetUrl) {
    return NextResponse.json({ error: "targetUrl is required" }, { status: 400 });
  }

  try {
    new URL(targetUrl);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const result = await runLoadTest({
    targetUrl,
    method: method ?? "GET",
    concurrency: Math.min(concurrency ?? 5, 50),
    totalRequests: Math.min(totalRequests ?? 20, 200),
  });

  return NextResponse.json(result, { status: 201 });
}
