import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { getSsoProviders, createSsoProvider } from "@/lib/sso";
import { createAuditLog } from "@/lib/audit-log";

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const providers = await getSsoProviders();
  return NextResponse.json(providers);
}

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { name, providerType, clientId, clientSecret, issuerUrl, enabled, buttonLabel } = body;

  if (!name || !providerType || !clientId || !clientSecret) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const validTypes = ["google", "microsoft", "github", "saml"];
  if (!validTypes.includes(providerType)) {
    return NextResponse.json({ error: "Invalid provider type" }, { status: 400 });
  }

  const provider = await createSsoProvider({ name, providerType, clientId, clientSecret, issuerUrl, enabled, buttonLabel });

  await createAuditLog({
    action: "create",
    resource: "sso",
    resourceId: provider.id,
    userId: user.id,
    details: { providerType, name },
  });

  return NextResponse.json(provider, { status: 201 });
}
