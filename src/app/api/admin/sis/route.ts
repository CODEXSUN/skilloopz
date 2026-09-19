import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { getSisConfigs, createSisConfig } from "@/lib/sis";
import { createAuditLog } from "@/lib/audit-log";

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const configs = await getSisConfigs();
  return NextResponse.json(configs);
}

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { name, provider, apiUrl, apiKey, csvMapping, schoolId, enabled } = body;

  if (!name || !provider) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const config = await createSisConfig({ name, provider, apiUrl, apiKey, csvMapping, schoolId, enabled: enabled ?? true });

  await createAuditLog({
    action: "create",
    resource: "sis",
    resourceId: config.id,
    userId: user.id,
    details: { name, provider },
  });

  return NextResponse.json(config, { status: 201 });
}
