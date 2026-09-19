import { NextResponse } from "next/server";
import { findLtiRegistration } from "@/lib/lti";
import { createSession, getSessionCookieName } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { jwtVerify, importJWK } from "jose";

interface LtiClaims {
  message_type?: string;
  roles?: string[];
  resource_link_id?: string;
  deployment_id?: string;
  deep_linking_settings?: {
    deep_link_return_url?: string;
    content_items?: unknown[];
  };
  custom?: Record<string, string>;
}

interface JwtPayload {
  iss: string;
  aud: string | string[];
  sub?: string;
  email?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  "https://purl.imsglobal.org/spec/lti/claim": LtiClaims;
  "https://purl.imsglobal.org/spec/lti/claim/custom"?: Record<string, string>;
  [key: string]: unknown;
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const idToken = formData.get("id_token") as string;

  if (!idToken) {
    return NextResponse.json({ error: "Missing id_token" }, { status: 400 });
  }

  const decoded = decodeJwtPayload(idToken);
  if (!decoded) {
    return NextResponse.json({ error: "Invalid token format" }, { status: 400 });
  }

  const iss = decoded.iss;
  const clientId = Array.isArray(decoded.aud) ? decoded.aud[0] : decoded.aud;
  const deploymentId = formData.get("ltid_deployment_id") as string || decoded["https://purl.imsglobal.org/spec/lti/claim"]?.deployment_id;

  const reg = await findLtiRegistration(iss, clientId);
  if (!reg || !reg.enabled) {
    return NextResponse.json({ error: "LTI registration not found or disabled" }, { status: 403 });
  }

  if (deploymentId && reg.deploymentId !== deploymentId) {
    return NextResponse.json({ error: "Deployment ID mismatch" }, { status: 403 });
  }

  try {
    const jwks = await fetch(reg.keysetUrl).then((r) => r.json());
    const key = await importJWK(jwks.keys[0]);
    await jwtVerify(idToken, key, { audience: clientId, issuer: iss });
  } catch {
    return NextResponse.json({ error: "Token verification failed" }, { status: 401 });
  }

  const ltiClaims = decoded["https://purl.imsglobal.org/spec/lti/claim"];
  if (!ltiClaims) {
    return NextResponse.json({ error: "Missing LTI claims" }, { status: 400 });
  }

  const messageType = ltiClaims.message_type;
  const roles = ltiClaims.roles || [];
  const resourceLink = ltiClaims.resource_link_id;

  const userClaim = decoded["https://purl.imsglobal.org/spec/lti/claim/custom"] || {};
  const email = decoded.email || userClaim.email || null;
  const name = decoded.name || userClaim.name || null;
  const givenName = decoded.given_name || null;
  const familyName = decoded.family_name || null;
  const fullName = name || `${givenName || ""} ${familyName || ""}`.trim() || null;

  const isTeacher = roles.some((r) =>
    r.includes("Instructor") || r.includes("Teacher") || r.includes("Administrator"),
  );
  const isStudent = roles.some((r) => r.includes("Learner") || r.includes("Student"));

  let userId: string;

  if (email) {
    const existing = await prisma.profile.findFirst({ where: { email } });
    if (existing) {
      userId = existing.id;
    } else {
      const newUser = await prisma.profile.create({
        data: {
          id: crypto.randomUUID(),
          email,
          fullName,
          role: isTeacher ? "teacher" : isStudent ? "student" : "student",
          emailVerified: new Date(),
        },
      });
      userId = newUser.id;
    }
  } else {
    const ltiUserId = decoded.sub || "unknown";
    const existing = await prisma.profile.findFirst({
      where: { email: `lti-${ltiUserId}@neot.local` },
    });
    if (existing) {
      userId = existing.id;
    } else {
      const newUser = await prisma.profile.create({
        data: {
          id: crypto.randomUUID(),
          email: `lti-${ltiUserId}@neot.local`,
          fullName: fullName || `LTI User ${ltiUserId.slice(0, 8)}`,
          role: isTeacher ? "teacher" : "student",
        },
      });
      userId = newUser.id;
    }
  }

  const token = await createSession(userId);

  if (messageType === "LtiDeepLinkingRequest") {
    const deepLinkReturnUrl = ltiClaims.deep_linking_settings?.deep_link_return_url;

    if (deepLinkReturnUrl) {
      const params = new URLSearchParams({
        jwt: idToken,
      });
      return NextResponse.redirect(`${deepLinkReturnUrl}?${params.toString()}`);
    }
  }

  const response = NextResponse.redirect(new URL("/", request.url));
  response.headers.set(
    "Set-Cookie",
    `${getSessionCookieName()}=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax`,
  );

  return response;
}

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = Buffer.from(parts[1], "base64url").toString("utf-8");
    return JSON.parse(payload) as JwtPayload;
  } catch {
    return null;
  }
}
