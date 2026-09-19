import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { getLtiRegistrations, createLtiRegistration } from "@/lib/lti";
import { createAuditLog } from "@/lib/audit-log";

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const regs = await getLtiRegistrations();
  return NextResponse.json(regs);
}

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { name, issuer, clientId, deploymentId, authUrl, tokenUrl, keysetUrl, enabled } = body;

  if (!name || !issuer || !clientId || !deploymentId || !authUrl || !tokenUrl || !keysetUrl) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const reg = await createLtiRegistration({ name, issuer, clientId, deploymentId, authUrl, tokenUrl, keysetUrl, enabled: enabled ?? true });

  await createAuditLog({
    action: "create",
    resource: "lti",
    resourceId: reg.id,
    userId: user.id,
    details: { name, issuer },
  });

  return NextResponse.json(reg, { status: 201 });
}
