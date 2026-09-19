const ALLOWED_ORIGINS = new Set([
  "http://localhost:3000",
  "http://localhost",
  process.env.NEXT_PUBLIC_SITE_URL,
].filter(Boolean));

export function validateOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  if (!origin && !referer) return true;
  if (origin && ALLOWED_ORIGINS.has(origin)) return true;
  if (referer) {
    try {
      const refOrigin = new URL(referer).origin;
      if (ALLOWED_ORIGINS.has(refOrigin)) return true;
    } catch {
      return false;
    }
  }
  return false;
}

export function csrfGuard(request: Request) {
  if (!validateOrigin(request)) {
    return new Response(JSON.stringify({ error: "CSRF validation failed" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }
  return null;
}
