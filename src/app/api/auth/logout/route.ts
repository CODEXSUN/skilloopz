import { NextResponse } from "next/server";
import { getSessionCookieName, deleteSession } from "@/lib/auth";
import { csrfGuard } from "@/lib/csrf";

function getTokenFromCookies(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie") ?? "";
  for (const cookie of cookieHeader.split(";")) {
    const [name, ...rest] = cookie.trim().split("=");
    if (name === getSessionCookieName()) return rest.join("=");
  }
  return null;
}

export async function POST(request: Request) {
  const csrfError = csrfGuard(request);
  if (csrfError) return csrfError;
  const token = getTokenFromCookies(request);
  if (token) await deleteSession(token);

  const response = NextResponse.json({ success: true });
  response.headers.set(
    "Set-Cookie",
    `${getSessionCookieName()}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`,
  );
  return response;
}
