import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { getMarketplaceApps, installApp, uninstallApp, getUserInstallations } from "@/lib/marketplace-apps";

export async function GET() {
  const apps = await getMarketplaceApps("approved");
  return NextResponse.json(apps);
}

export async function POST(request: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { appId, config } = await request.json();
  if (!appId) return NextResponse.json({ error: "App ID required" }, { status: 400 });

  try {
    await installApp(appId, userId, null, config);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Already installed or failed" }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { appId } = await request.json();
  if (!appId) return NextResponse.json({ error: "App ID required" }, { status: 400 });

  try {
    await uninstallApp(appId, userId, null);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Not installed" }, { status: 404 });
  }
}
