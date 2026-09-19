import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { verifyPassword, createSession, getSessionCookieName } from "@/lib/auth";
import { checkRateLimit, getRateLimitRemaining } from "@/lib/rate-limit";
import { csrfGuard } from "@/lib/csrf";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  const csrfError = csrfGuard(request);
  if (csrfError) return csrfError;

  const body = await request.json();
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 400 });
  }

  const { email } = parsed.data;

  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const rateKey = `login:${ip}`;
  if (!checkRateLimit(rateKey)) {
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      {
        status: 429,
        headers: { "Retry-After": "60" },
      },
    );
  }

  const profile = await prisma.profile.findFirst({ where: { email } });
  if (!profile || !profile.passwordHash || !verifyPassword(parsed.data.password, profile.passwordHash)) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      {
        status: 401,
        headers: { "X-RateLimit-Remaining": String(getRateLimitRemaining(rateKey)) },
      },
    );
  }

  const token = await createSession(profile.id);
  const response = NextResponse.json({ success: true });
  response.headers.set(
    "Set-Cookie",
    `${getSessionCookieName()}=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax`,
  );
  response.headers.set("X-RateLimit-Remaining", String(getRateLimitRemaining(rateKey)));
  return response;
}
