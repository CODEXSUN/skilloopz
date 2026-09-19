import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSsoProvider, handleSsoCallback } from "@/lib/sso";
import { createSession, getSessionCookieName } from "@/lib/auth";

export async function GET(request: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider: providerId } = await params;
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL("/login?error=sso_denied", request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=sso_no_code", request.url));
  }

  const cookieStore = await cookies();
  const savedState = cookieStore.get("sso_state")?.value;
  const savedProvider = cookieStore.get("sso_provider")?.value;

  if (!savedProvider || savedProvider !== providerId) {
    return NextResponse.redirect(new URL("/login?error=sso_mismatch", request.url));
  }

  if (state && savedState && state !== savedState) {
    return NextResponse.redirect(new URL("/login?error=sso_invalid_state", request.url));
  }

  const provider = await getSsoProvider(providerId);
  if (!provider) {
    return NextResponse.redirect(new URL("/login?error=sso_not_found", request.url));
  }

  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const host = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_APP_URL || "localhost:3000";
  const redirectUri = `${protocol}://${host}/api/auth/sso/${providerId}/callback`;

  try {
    const { userId } = await handleSsoCallback(provider, code, redirectUri);
    const token = await createSession(userId);

    const response = NextResponse.redirect(new URL("/onboarding", request.url));
    response.headers.set(
      "Set-Cookie",
      `${getSessionCookieName()}=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax`,
    );

    response.cookies.delete("sso_state");
    response.cookies.delete("sso_provider");

    return response;
  } catch (err) {
    console.error("SSO callback error:", err);
    return NextResponse.redirect(new URL("/login?error=sso_failed", request.url));
  }
}
