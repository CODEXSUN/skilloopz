import { NextResponse } from "next/server";
import { getEnabledSsoProviders } from "@/lib/sso";

export async function GET() {
  const providers = await getEnabledSsoProviders();
  const safe = providers.map((p) => ({
    id: p.id,
    name: p.name,
    providerType: p.providerType,
    buttonLabel: p.buttonLabel,
    iconUrl: p.iconUrl,
  }));
  return NextResponse.json(safe);
}
