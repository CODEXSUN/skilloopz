import { NextResponse } from "next/server";
import { findLtiRegistration } from "@/lib/lti";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const iss = searchParams.get("iss")!;
  const clientId = searchParams.get("client_id")!;
  const loginHint = searchParams.get("login_hint");
  const targetLinkUri = searchParams.get("target_link_uri");
  const ltiMessageHint = searchParams.get("lti_message_hint");
  const redirectUri = searchParams.get("redirect_uri");

  if (!iss || !clientId || !redirectUri) {
    return NextResponse.json({ error: "Missing required OIDC parameters" }, { status: 400 });
  }

  const reg = await findLtiRegistration(iss, clientId);
  if (!reg) {
    return NextResponse.json({ error: "LTI registration not found" }, { status: 404 });
  }

  if (!reg.enabled) {
    return NextResponse.json({ error: "LTI registration is disabled" }, { status: 403 });
  }

  const authParams = new URLSearchParams({
    client_id: clientId,
    login_hint: loginHint || "",
    redirect_uri: redirectUri,
    response_type: "id_token",
    scope: "openid",
    state: searchParams.get("state") || "",
    nonce: crypto.randomUUID(),
    prompt: "none",
  });

  if (ltiMessageHint) {
    authParams.set("lti_message_hint", ltiMessageHint);
  }

  if (targetLinkUri) {
    authParams.set("target_link_uri", targetLinkUri);
  }

  const authUrl = `${reg.authUrl}?${authParams.toString()}`;

  return NextResponse.redirect(authUrl);
}
