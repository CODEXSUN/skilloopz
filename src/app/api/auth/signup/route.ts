import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword, createSession, getSessionCookieName } from "@/lib/auth";
import { csrfGuard } from "@/lib/csrf";
import { notifyNewUser } from "@/lib/notifications";
import { sendVerificationEmail, sendWelcomeEmail } from "@/lib/email";

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  ageGroup: z.enum(["under13", "13to18", "18plus"]).optional(),
  fullName: z.string().optional(),
  role: z.enum(["student", "teacher", "parent"]).optional().default("student"),
});

export async function POST(request: Request) {
  const csrfError = csrfGuard(request);
  if (csrfError) return csrfError;

  const body = await request.json();
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { email, password, ageGroup, fullName, role } = parsed.data;

  const existing = await prisma.profile.findFirst({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
  }

  const id = crypto.randomUUID();
  const hashedPassword = hashPassword(password);
  const verificationToken = crypto.randomUUID();

  await prisma.profile.create({
    data: {
      id,
      email,
      fullName: fullName ?? null,
      passwordHash: hashedPassword,
      ageGroup: ageGroup ?? null,
      role: role,
      verificationToken,
    },
  });

  await notifyNewUser(id, fullName ?? null, role);

  sendVerificationEmail(email, verificationToken);
  sendWelcomeEmail(email, fullName ?? null);

  const token = await createSession(id);
  const response = NextResponse.json({ success: true, verificationToken });
  response.headers.set(
    "Set-Cookie",
    `${getSessionCookieName()}=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax`,
  );
  return response;
}
