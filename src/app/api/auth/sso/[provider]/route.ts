import { NextResponse } from "next/server";
import { getSsoProvider } from "@/lib/sso";
import { buildAuthorizeUrl } from "@/lib/sso";

export async function GET(_request: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider: providerId } = await params;

  const provider = await getSsoProvider(providerId);
  if (!provider) {
    return NextResponse.json({ error: "SSO provider not found" }, { status: 404 });
  }
  if (!provider.enabled) {
    return NextResponse.json({ error: "SSO provider is disabled" }, { status: 403 });
  }

  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const host = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_APP_URL || "localhost:3000";
  const redirectUri = `${protocol}://${host}/api/auth/sso/${providerId}/callback`;

  const state = crypto.randomUUID();

  const authorizeUrl = buildAuthorizeUrl(provider, redirectUri, state);

  const response = NextResponse.redirect(authorizeUrl);

  response.cookies.set("sso_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10,
    path: "/",
  });
  response.cookies.set("sso_provider", providerId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10,
    path: "/",
  });

  return response;
}
